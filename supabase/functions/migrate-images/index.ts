import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const OLD_URL = "https://uyuuvfyicgdmjdgmxuox.supabase.co";
    const OLD_SERVICE_KEY = "sb_secret_poDkZH2UU2iOOGEDQ6gl0g_ysg6JBT_";
    const NEW_URL = Deno.env.get("SUPABASE_URL")!;
    const NEW_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const oldClient = createClient(OLD_URL, OLD_SERVICE_KEY);
    const newClient = createClient(NEW_URL, NEW_SERVICE_KEY);

    // List all files in old storage
    const { data: files, error: listError } = await oldClient.storage
      .from("images")
      .list("", { limit: 1000 });

    if (listError) {
      return new Response(JSON.stringify({ error: listError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Support offset/limit for batching
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const batchSize = parseInt(url.searchParams.get("batch") || "10");

    const batch = (files || []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    const totalFiles = batch.length;
    const slice = batch.slice(offset, offset + batchSize);

    const results: { name: string; status: string; error?: string }[] = [];

    for (const file of slice) {
      try {
        const { data: fileData, error: downloadError } = await oldClient.storage
          .from("images")
          .download(file.name);

        if (downloadError || !fileData) {
          results.push({ name: file.name, status: "failed", error: downloadError?.message });
          continue;
        }

        const { error: uploadError } = await newClient.storage
          .from("images")
          .upload(file.name, fileData, { upsert: true, contentType: file.metadata?.mimetype });

        if (uploadError) {
          results.push({ name: file.name, status: "failed", error: uploadError.message });
        } else {
          results.push({ name: file.name, status: "ok" });
        }
      } catch (e) {
        results.push({ name: file.name, status: "failed", error: String(e) });
      }
    }

    const ok = results.filter((r) => r.status === "ok").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const nextOffset = offset + batchSize;
    const hasMore = nextOffset < totalFiles;

    return new Response(
      JSON.stringify({ totalFiles, offset, batchSize, ok, failed, hasMore, nextOffset, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
