// frappe.ui.form.on('Service Request', {
//     sales_invoice(frm) {
//         if (!frm.doc.sales_invoice) return;

//         frm.clear_table("service_request_item");

//         frappe.call({
//             method: "frappe.client.get",
//             args: {
//                 doctype: "Sales Invoice",
//                 name: frm.doc.sales_invoice
//             },
//             callback(r) {
//                 if (!r.message) return;

//                 let invoice = r.message;
//                 frm.set_value("customer", invoice.customer);

//                 invoice.items.forEach(item => {
//                     frappe.msgprint(`Item: ${item.item_code}, Expiry: ${item.custom_warranty_expiry_date}`);

//                     let row = frm.add_child("service_request_item", {
//                         item_code: item.item_code,
//                         warranty_expiry_date: item.custom_warranty_expiry_date,
//                         item_name: item.item_name // ✅ Add this line
//                     });
//                 });

//                 frm.refresh_field("service_request_item");
//             }
//         });
//     }
// });
frappe.ui.form.on("Service Request", {
    refresh(frm) {
        // Disable Add Row in child table
        frm.fields_dict.service_request_item.grid.wrapper.find('.grid-add-row').hide();
    },

    sales_invoice(frm) {
        if (!frm.doc.sales_invoice) return;

        frm.clear_table("service_request_item");

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Sales Invoice",
                name: frm.doc.sales_invoice
            },
            callback(r) {
                if (!r.message) return;

                let invoice = r.message;
                frm.set_value("customer", invoice.customer);

                invoice.items.forEach(item => {
                    const expiry_date = item.custom_warranty_expiry_date;

                    if (expiry_date && frappe.datetime.get_diff(frappe.datetime.now_date(), expiry_date) > 0) {
                        expired_items.push(`${item.item_code} (Expired: ${expiry_date})`);
                        return;
                    }

                    frm.add_child("service_request_item", {
                        item_code: item.item_code,
                        item_name: item.item_name,
                        warranty_expiry_date: item.custom_warranty_expiry_date
                    });
                });

                frm.refresh_field("service_request_item");

                if (expired_items.length > 0) {
                    frappe.msgprint({
                        title: __("Expired Warranty Items"),
                        message: __("The following items were not added because their warranty expired:<br><br><b>{0}</b>").format(expired_items.join("<br>")),
                    });
                }            }
        });
    }
});
