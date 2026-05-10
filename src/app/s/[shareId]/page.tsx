import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import PublicNoteViewer from '@/components/PublicNoteViewer';

// This will be used for dynamic metadata
export async function generateMetadata(props: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const params = await props.params;
  try {
    const { data: note } = await supabase
      .from('notes')
      .select('title, content, excerpt, updated_at')
      .eq('share_id', params.shareId)
      .eq('is_shared', true)
      .single();

    if (note) {
      const description = note.excerpt || note.content.replace(/<[^>]*>/g, '').substring(0, 160) || 'A shared note from NotepadX';

      return {
        title: `${note.title} - NotepadX`,
        description,
        openGraph: {
          title: note.title,
          description,
          type: 'article',
          publishedTime: note.updated_at,
          siteName: 'NotepadX',
        },
        twitter: {
          card: 'summary_large_image',
          title: note.title,
          description,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Shared Note - NotepadX',
    description: 'A shared note from NotepadX',
  };
}

export default function PublicNotePage() {
  return <PublicNoteViewer />;
}