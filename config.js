APP_CONFIG = {
  supabase: {
    url: "https://qdvhobijcfbhnfzxpvlq.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdmhvYmlqY2ZiaG5menhwdmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTU0MzUsImV4cCI6MjA4MzI3MTQzNX0.qZA2_a7PdVpRxJJLoG5UKnnL3POcAT4Zy7BsPmCwvLc",
    tables: {
      // Your database table names (actual tables in Supabase):
      case_logins: 'case_logins',
      clients: 'clients',
      cases: 'cases',
      client_documents: 'client_documents',
      client_tasks: 'client_tasks',
      case_updates: 'case_updates',
      document_templates: 'document_templates',
      
      // Aliases for backward compatibility (if your code uses these):
      documents: 'client_documents',    // alias
      tasks: 'client_tasks',            // alias  
      updates: 'case_updates'           // alias
    }
  }
};
