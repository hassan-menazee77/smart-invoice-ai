// Company management functions for Supabase
async function getMyCompany() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabaseClient
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error || !data) return null;
  return data;
}

async function createCompany(companyData) {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabaseClient
    .from('companies')
    .insert([{ ...companyData, user_id: user.id }])
    .select()
    .single();
  
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

async function updateCompany(companyId, companyData) {
  const { data, error } = await supabaseClient
    .from('companies')
    .update(companyData)
    .eq('id', companyId)
    .select()
    .single();
  
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

async function getClientsByCompany(companyId) {
  const { data, error } = await supabaseClient
    .from('clients')
    .select('*')
    .eq('company_id', companyId);
  
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

async function createClient(clientData) {
  const { data, error } = await supabaseClient
    .from('clients')
    .insert([clientData])
    .select()
    .single();
  
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}
