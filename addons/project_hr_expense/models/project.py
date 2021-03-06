# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import json

from odoo import api, fields, models, _, _lt
from odoo.osv import expression

class Project(models.Model):
    _inherit = 'project.project'

    expenses_count = fields.Integer('# Expenses', compute='_compute_expenses_count', groups='hr_expense.group_hr_expense_team_approver')

    @api.depends('analytic_account_id')
    def _compute_expenses_count(self):
        if not self.analytic_account_id:
            self.expenses_count = 0
            return
        expenses_data = self.env['hr.expense']._read_group([
            ('analytic_account_id', '!=', False),
            ('analytic_account_id', 'in', self.analytic_account_id.ids)
        ],
        ['analytic_account_id'], ['analytic_account_id'])
        mapped_data = {data['analytic_account_id'][0]: data['analytic_account_id_count'] for data in expenses_data}
        for project in self:
            project.expenses_count = mapped_data.get(project.analytic_account_id.id, 0)

    # ----------------------------
    #  Actions
    # ----------------------------

    def _get_expense_action(self, domain=None, expense_ids=None):
        if not domain and not expense_ids:
            return {}
        action = self.env["ir.actions.actions"]._for_xml_id("hr_expense.hr_expense_actions_all")
        action.update({
            'display_name': _('Expenses'),
            'views': [[False, 'tree'], [False, 'form'], [False, 'kanban'], [False, 'graph'], [False, 'pivot']],
            'context': {'default_analytic_account_id': self.analytic_account_id.id},
            'domain': domain or [('id', 'in', expense_ids)],
        })
        if len(expense_ids) == 1:
            action["views"] = [[False, 'form']]
            action["res_id"] = expense_ids[0]
        return action

    def action_open_project_expenses(self):
        if not self.analytic_account_id:
            return {'type': 'ir.actions.act_window_close'}
        expense_ids = self.env['hr.expense']._search([
            ('analytic_account_id', 'in', self.analytic_account_id.ids)
        ])
        return self._get_expense_action(expense_ids=expense_ids)

    def action_profitability_items(self, section_name, domain=None, res_id=False):
        if section_name == 'expenses':
            return self._get_expense_action(domain, [res_id] if res_id else [])
        return super().action_profitability_items(section_name, domain, res_id)

    # ----------------------------
    #  Project Update
    # ----------------------------

    def _get_profitability_labels(self):
        labels = super()._get_profitability_labels()
        labels['expenses'] = _lt('Expenses')
        return labels

    def _get_profitability_sequence_per_invoice_type(self):
        sequence_per_invoice_type = super()._get_profitability_sequence_per_invoice_type()
        sequence_per_invoice_type['expenses'] = 11
        return sequence_per_invoice_type

    def _get_expenses_profitability_items(self, with_action=True):
        if not self.analytic_account_id:
            return {}
        can_see_expense = with_action and self.user_has_groups('hr_expense.group_hr_expense_team_approver')
        expenses_read_group = self.env['hr.expense'].sudo()._read_group(
            [('analytic_account_id', 'in', self.analytic_account_id.ids),
             ('is_refused', '=', False),
             ('state', 'in', ['approved', 'done'])],
            ['untaxed_amount', 'ids:array_agg(id)'],
            [],
        )
        if not expenses_read_group or not expenses_read_group[0]['__count']:
            return {}
        expense_data = expenses_read_group[0]
        section_id = 'expenses'
        expense_profitability_items = {
            'costs': {'id': section_id, 'sequence': self._get_profitability_sequence_per_invoice_type()[section_id], 'billed': -expense_data['untaxed_amount'], 'to_bill': 0.0},
        }
        if can_see_expense:
            action = {'name': 'action_profitability_items', 'type': 'object', 'section': section_id, 'domain': json.dumps([('id', 'in', expense_data['ids'])])}
            if expense_data['ids']:
                action['res_id'] = expense_data['ids']
            expense_profitability_items['action'] = action
        return expense_profitability_items

    def _get_profitability_aal_domain(self):
        return expression.AND([
            super()._get_profitability_aal_domain(),
            ['|', ('move_id', '=', False), ('move_id.expense_id', '=', False)],
        ])

    def _get_profitability_items(self, with_action=True):
        profitability_data = super()._get_profitability_items(with_action)
        expenses_data = self._get_expenses_profitability_items(with_action)
        if expenses_data:
            if 'revenues' in expenses_data:
                revenues = profitability_data['revenues']
                revenues['data'].append(expenses_data['revenues'])
                revenues['total'] = {k: revenues['total'][k] + expenses_data['revenues'][k] for k in ['invoiced', 'to_invoice']}
            costs = profitability_data['costs']
            costs['data'].append(expenses_data['costs'])
            costs['total'] = {k: costs['total'][k] + expenses_data['costs'][k] for k in ['billed', 'to_bill']}
        return profitability_data
