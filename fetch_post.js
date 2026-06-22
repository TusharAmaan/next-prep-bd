const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFileContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFileContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, content_body')
    .eq('slug', 'errors-in-hypothesis-testing')
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    process.exit(1);
  }

  console.log('Post Title:', data.title);
  fs.writeFileSync('post_body.html', data.content_body, 'utf-8');
  console.log('Successfully wrote content to post_body.html');
}

run();
