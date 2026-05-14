import os

root_dir = r"d:\IMP\GitHub\primesetu"
skills_dir = os.path.join(root_dir, "skills")
output_file = os.path.join(root_dir, "PRIME_SETU_DEVELOPMENT_MASTER.md")

core_files = ["aitdl.md", "AGENTS.md", "aiprotocol.md", "AI_GUIDELINES.md"]
skill_files = sorted([f for f in os.listdir(skills_dir) if f.endswith(".md")])

with open(output_file, "w", encoding="utf-8") as out:
    out.write("# PRIME SETU DEVELOPMENT MASTER REFERENCE\n")
    out.write("> Consolidated on April 2026\n\n")
    
    # Process Core Files
    for filename in core_files:
        filepath = os.path.join(root_dir, filename)
        if os.path.exists(filepath):
            out.write(f"\n\n{'='*80}\n")
            out.write(f"# FILE: {filename}\n")
            out.write(f"{'='*80}\n\n")
            with open(filepath, "r", encoding="utf-8") as f:
                out.write(f.read())
            out.write("\n")

    # Process Skill Files
    out.write(f"\n\n{'#'*80}\n")
    out.write(f"# SKILLS DIRECTORY CONSOLIDATION\n")
    out.write(f"{'#'*80}\n\n")
    
    for filename in skill_files:
        filepath = os.path.join(skills_dir, filename)
        out.write(f"\n\n{'-'*80}\n")
        out.write(f"## SKILL: {filename}\n")
        out.write(f"{'-'*80}\n\n")
        with open(filepath, "r", encoding="utf-8") as f:
            out.write(f.read())
        out.write("\n")

print(f"Successfully consolidated into {output_file}")
