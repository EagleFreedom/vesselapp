import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Use service role key for user creation (only on server)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create public.users row
    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert([{ id: userId, email }]);

    if (userError) {
      console.error("Error creating user row:", userError);
      // Continue anyway — the auth user was created
    }

    return NextResponse.json(
      { success: true, user_id: userId, email },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
