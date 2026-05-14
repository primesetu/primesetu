import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        z = zipfile.ZipFile(path)
        content = z.read('word/document.xml')
        root = ET.fromstring(content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = '\n'.join([t.text for t in root.iterfind('.//w:t', ns) if t.text])
        return text
    except Exception as e:
        return f"Error reading {path}: {e}"

if __name__ == "__main__":
    doc1 = r"d:\IMP\GitHub\primesetu\.SmritiOs\SmritiOS_Migration_Handbook_v3.0.docx"
    doc2 = r"d:\IMP\GitHub\primesetu\.SmritiOs\SmritiOS_Migration_Handbook_v2.0.docx"
    with open(r"d:\IMP\GitHub\primesetu\scratch\doc_content.txt", "w", encoding="utf-8") as f:
        f.write(f"--- {doc1} ---\n{read_docx(doc1)}\n\n")
        f.write(f"--- {doc2} ---\n{read_docx(doc2)}\n\n")
