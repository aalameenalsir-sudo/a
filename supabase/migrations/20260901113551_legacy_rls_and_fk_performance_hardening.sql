create index if not exists activity_log_user_id_idx on public.activity_log(user_id);
create index if not exists client_projects_owner_id_idx on public.client_projects(owner_id);
create index if not exists contracts_project_id_idx on public.contracts(project_id);
create index if not exists crm_activities_created_by_idx on public.crm_activities(created_by);
create index if not exists documents_project_id_idx on public.documents(project_id);
create index if not exists expenses_client_id_idx on public.expenses(client_id);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index if not exists invoices_project_id_idx on public.invoices(project_id);
create index if not exists invoices_quotation_id_idx on public.invoices(quotation_id);
create index if not exists opportunities_owner_id_idx on public.opportunities(owner_id);
create index if not exists quotation_items_quotation_id_idx on public.quotation_items(quotation_id);
create index if not exists site_content_updated_by_idx on public.site_content(updated_by);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_client_id_idx on public.tasks(client_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);

alter policy "Users can read own profile" on public.profiles using ((select auth.uid()) = id);
alter policy "Users can read own notifications" on public.notifications using ((select auth.uid()) = user_id);
alter policy "Users can update own notifications" on public.notifications using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
