frappe.ui.form.on('Sales Invoice', {
    posting_date(frm) {
        // Trigger recalculation when posting_date is changed
        frm.fields_dict.items.grid.get_data().forEach((d, i) => {
            if (d.item_code) {
                set_expiry_date(frm, d.doctype, d.name, d.item_code);
            }
        });
    }
});

frappe.ui.form.on('Sales Invoice Item', {
    item_code(frm, cdt, cdn) {
        const row = frappe.get_doc(cdt, cdn);
        set_expiry_date(frm, cdt, cdn, row.item_code);
    }
});

function set_expiry_date(frm, cdt, cdn, item_code) {
    if (!item_code || !frm.doc.posting_date) return;

    frappe.db.get_value("Item", item_code, ["warranty_period", "item_name"]).then(res => {
        const data = res.message;

        if (data) {
            frappe.model.set_value(cdt, cdn, "item_name", data.item_name);

            if (data.warranty_period) {
                const posting_date = frappe.datetime.str_to_obj(frm.doc.posting_date);
                const expiry_date = frappe.datetime.add_days(posting_date, parseInt(data.warranty_period));
                
                frappe.model.set_value(cdt, cdn, "custom_warranty_expiry_date", frappe.datetime.obj_to_str(expiry_date));
            }
        }
    });
}
