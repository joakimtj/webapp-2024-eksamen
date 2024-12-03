import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    className?: string;
}

const TiptapEditor = ({ content, onChange, className = '' }: TiptapEditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getText());
        },
    });

    return (
        <div className={`border rounded p-2 ${className}`}>
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;