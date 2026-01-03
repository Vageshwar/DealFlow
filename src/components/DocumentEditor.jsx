import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { GitCompare } from 'lucide-react';

const DocumentEditor = forwardRef(({ code, originalContent, onChange, onSave }, ref) => {
    const [localCode, setLocalCode] = useState(code);
    const [showDiff, setShowDiff] = useState(false);

    const editorRef = useRef(null);
    const timeoutRef = useRef(null);
    const isLocalChange = useRef(false);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        insertText: (text) => {
            const editor = editorRef.current;
            if (!editor) return;

            const selection = editor.getSelection();
            const op = {
                range: selection,
                text: text,
                forceMoveMarkers: true
            };
            editor.executeEdits("clause-insert", [op]);
            // Trigger formatting or other actions if needed
            editor.focus();
        }
    }));

    // Calculate if there are uncommitted changes (strict equality)
    const isDirty = localCode !== originalContent;

    // Sync local state when prop changes (from remote)
    // Only update if we didn't just type it ourselves to avoid cursor jumps
    useEffect(() => {
        if (!isLocalChange.current && code !== localCode) {
            setLocalCode(code);
        }
        isLocalChange.current = false;
    }, [code]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleEditorChange = (value) => {
        setLocalCode(value);
        isLocalChange.current = true;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onChange(value), 300);
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">filename:</span>
                    <span className="text-sm font-medium text-slate-200">Term_Sheet_Draft_v1.txt</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowDiff(!showDiff)}
                        className={`text-xs px-3 py-1 rounded transition-colors flex items-center gap-2 border ${showDiff ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                    >
                        <GitCompare className="w-3 h-3" />
                        {showDiff ? 'Hide Diff' : 'Comparisons'}
                    </button>

                    <button
                        onClick={onSave}
                        disabled={!isDirty}
                        className={`text-xs px-3 py-1 rounded transition-all font-medium tracking-wide flex items-center gap-2
                             ${isDirty
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                          `}
                    >
                        {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {isDirty ? 'COMMIT CHANGE' : 'NO CHANGES'}
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {showDiff ? (
                    <DiffEditor
                        height="100%"
                        theme="vs-dark"
                        original={originalContent}
                        modified={localCode}
                        options={{
                            renderSideBySide: true,
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            readOnly: true // Diff view usually read-only or confusing if editable
                        }}
                    />
                ) : (
                    <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        theme="vs-dark"
                        value={localCode}
                        onMount={handleEditorDidMount}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                )}
            </div>
        </div>
    );
});

export default DocumentEditor;
