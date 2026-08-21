-- The platform's legacy defaults also grant non-CRUD table privileges and
-- sequence UPDATE. They do not create REST endpoints by themselves, but no
-- Data API role needs them. Remove the complete default ACL so every future
-- object starts private and must be exposed deliberately.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON FUNCTIONS FROM anon, authenticated, service_role, PUBLIC;
