import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Flag to easily switch between Tiptap and regular textarea
const USE_TIPTAP = true;

interface TextEditorProps {
    content: string;
    onChange: (content: string) => void;
    className?: string;
    id?: string;
    name?: string;
}

// Separate Tiptap component for cleaner organization
const TiptapEditor = ({ content, onChange, className = '' }: TextEditorProps) => {
    const plainContent = content.replace(/<[^>]*>/g, '');

    const editor = useEditor({
        extensions: [StarterKit],
        content: plainContent,
        onUpdate: ({ editor }) => {
            const plainText = editor.getText();
            onChange(plainText);
        },
    });

    return (
        <div className={`border rounded p-2 ${className}`}>
            <EditorContent editor={editor} />
        </div>
    );
};

// Main TextEditor component that switches between implementations
const TextEditor = ({ content, onChange, className = '', id, name }: TextEditorProps) => {
    if (USE_TIPTAP) {
        return (
            <TiptapEditor
                content={content}
                onChange={onChange}
                className={className}
                id={id}
                name={name}
            />
        );
    }

    return (
        <textarea
            id={id}
            name={name}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className={`${className} w-full rounded`}
            cols={30}
        />
    );
};

export default TextEditor;