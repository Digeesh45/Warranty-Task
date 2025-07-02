# Copyright (c) 2025, e and contributors
# For license information, please see license.txt

# import frappe

# from frappe.model.document import Document
# from frappe import _
# from datetime import datetime

# class ServiceRequest(Document):
#     def validate(self):
#         today = self.request_date or frappe.utils.today()
#         remaining_items = []
#         expired_items = []

#         for item in self.service_request_item:
#             if item.warranty_expiry_date and item.warranty_expiry_date < today:
#                 expired_items.append(item.item_code)
#             else:
#                 remaining_items.append(item)

#         if expired_items:
#             frappe.msgprint(_("These items are out of warranty and have been removed: {0}").format(", ".join(expired_items)))

#         self.set("service_request_item", remaining_items)

from frappe.model.document import Document
from frappe import _
from frappe.utils import getdate, today

class ServiceRequest(Document):
    def validate(self):
        if not self.request_date:
            self.request_date = today()

        valid_items = []
        expired_items = []

        for row in self.service_request_item:
            if row.warranty_expiry_date and getdate(row.warranty_expiry_date) < getdate(self.request_date):
                expired_items.append(row.item_code)
            else:
                valid_items.append(row)

        if expired_items:
            frappe.msgprint(
                _("These items are out of warranty and have been removed: {0}").format(", ".join(expired_items))
            )

        self.set("service_request_item", valid_items)
