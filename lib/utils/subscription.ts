export async function getUserSubscription(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user")
    .select("subscription_status, subscription_period_end")
    .eq("id", userId)
    .single();

  return {
    isPremium: data?.subscription_status === "premium",
    periodEnd: data?.subscription_period_end,
  };
}
