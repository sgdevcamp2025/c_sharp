export const handleShiftEnterIndent = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  autoResizeTextarea: () => void,
) => {
  e.preventDefault();
  const textarea = e.currentTarget;
  const { selectionStart, selectionEnd, value } = textarea;

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;

  const currentLine = value.substring(lineStart, selectionStart);
  const indentMatch = currentLine.match(/^\s*/);
  const indent = indentMatch ? indentMatch[0] : '';

  const newText =
    value.substring(0, selectionStart) +
    '\n' +
    indent +
    value.substring(selectionEnd);

  textarea.value = newText;

  const newPos = selectionStart + 1 + indent.length;
  textarea.setSelectionRange(newPos, newPos);

  autoResizeTextarea();
};
