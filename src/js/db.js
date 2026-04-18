const supabaseClient = supabase.createClient(
  "https://byawcywmkxbjkcvssynh.supabase.co",
  "sb_publishable_mRbj_xWSUgp4NCF7zmejHQ_U3GRXsUT"
);

async function getItems(userId) {
  let { data } = await supabaseClient
    .from("items")
    .select("*")
    .eq("user_id", userId);

  return data || [];
}

async function addItemDB(item) {
  await supabaseClient.from("items").insert([item]);
}

async function deleteItemDB(id) {
  await supabaseClient.from("items").delete().eq("id", id);
}

async function updateItemDB(id, data) {
  await supabaseClient.from("items").update(data).eq("id", id);
}