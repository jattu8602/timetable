import os
from generate_timetables import timetables, periods

# Create target directory
output_dir = "/Users/jattu/Desktop/admin_samayak/tt_md"
os.makedirs(output_dir, exist_ok=True)

def generate_html_table(slots_data):
    # Days order
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    
    html = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; text-align: center; width: 100%; font-family: sans-serif; border: 1.5px solid #333;">\n'
    
    # Headers
    html += '  <thead>\n'
    html += '    <tr style="background-color: #f2f2f2; font-weight: bold; border-bottom: 2px solid #333;">\n'
    html += '      <th rowspan="2" style="padding: 10px; border: 1px solid #333; width: 10%;">Days</th>\n'
    
    # Header Row 1: Period names
    for p in periods:
        if p["num"] == "LUNCH":
            html += '      <th style="border: 1px solid #333; width: 8%;">LUNCH</th>\n'
        else:
            html += f'      <th style="border: 1px solid #333; width: 9%;">{p["num"]}</th>\n'
    html += '    </tr>\n'
    
    # Header Row 2: Timings
    html += '    <tr style="background-color: #f8f8f8; font-size: 0.85em; border-bottom: 2px solid #333;">\n'
    for p in periods:
        html += f'      <td style="border: 1px solid #333; padding: 6px; font-weight: bold;">{p["time"]}</td>\n'
    html += '    </tr>\n'
    html += '  </thead>\n'
    
    html += '  <tbody>\n'
    for day_idx, day in enumerate(days):
        html += '    <tr style="height: 60px;">\n'
        html += f'      <td style="font-weight: bold; background-color: #f9f9f9; padding: 10px; border: 1px solid #333;">{day}</td>\n'
        
        # Get slots sorted by start
        day_slots = sorted(slots_data[day], key=lambda x: x["start"])
        
        # Map each of the 10 periods (1-indexed) to their cell output
        p_idx = 1
        while p_idx <= 10:
            # Check if there is a slot starting at p_idx
            slot = None
            for s in day_slots:
                if s["start"] == p_idx:
                    slot = s
                    break
            
            if slot:
                span = slot["end"] - slot["start"] + 1
                text = slot["text"].replace("\n", "<br>")
                
                # Check for special LUNCH-BREAK handling
                if p_idx == 6: # Lunch index
                    if day_idx == 0:
                        # Monday gets the rowspan="5" for Lunch Break
                        html += '      <td rowspan="5" style="background-color: #e6e6e6; font-weight: bold; padding: 10px; border: 1px solid #333; font-size: 1.1em; letter-spacing: 2px; width: 8%;">LUNCH -<br>BREAK</td>\n'
                    # For Tuesday-Friday, we do NOT print anything for slot 6
                else:
                    colspan_attr = f' colspan="{span}"' if span > 1 else ''
                    style = ' style="background-color: #fafafa; border: 1px solid #333;"' if text == "" else ' style="padding: 8px; border: 1px solid #333; font-weight: 550; background-color: #ffffff;"'
                    html += f'      <td{colspan_attr}{style}>{text}</td>\n'
                p_idx = slot["end"] + 1
            else:
                if p_idx == 6 and day_idx > 0:
                    pass
                else:
                    html += '      <td style="background-color: #fafafa; border: 1px solid #333;"></td>\n'
                p_idx += 1
        html += '    </tr>\n'
    html += '  </tbody>\n'
    html += '</table>'
    return html

# Generate markdown files
for tt in timetables:
    file_id = tt["file_id"]
    m = tt["metadata"]
    filename = f"tt{file_id}.md"
    filepath = os.path.join(output_dir, filename)
    
    # Render Styled HTML Table
    styled_table = generate_html_table(tt["slots"])
    
    # Render Courses Table in Markdown
    course_list_str = "| Course Code | Course Type | Course Name | Credit | Teacher |\n"
    course_list_str += "| :--- | :--- | :--- | :--- | :--- |\n"
    for c in tt["courses"]:
        course_list_str += f"| **{c['code']}** | {c['type']} | {c['name']} | {c['credits']} | {c['teacher']} |\n"
        
    # Signature Section
    sig_dean_title = "Dean (UG Studies)" if "UG" in m["semester"] or "VI" in m["semester"] or "IV" in m["semester"] else "Dean (PG Studies)"
    if "MCA" in m["program"] or "M.Tech" in m["program"]:
        sig_dean_title = "Dean (PG Studies)"
        
    sig_str = f"""
<table style="width: 100%; border: none; margin-top: 30px; font-family: sans-serif; font-size: 0.9em; line-height: 1.4;">
  <tr style="border: none;">
    <td style="border: none; text-align: left; width: 25%; padding: 10px; vertical-align: top;">
      <div style="border-top: 1px solid #666; padding-top: 8px;">
        <b>Prem Prakash</b><br>
        Co-ordinator Central Time Table<br>
        <i>BIT Mesra</i>
      </div>
    </td>
    <td style="border: none; text-align: center; width: 25%; padding: 10px; vertical-align: top;">
      <div style="border-top: 1px solid #666; padding-top: 8px;">
        <b>Shamar</b><br>
        Department Time Table Coordinator
      </div>
    </td>
    <td style="border: none; text-align: center; width: 25%; padding: 10px; vertical-align: top;">
      <div style="border-top: 1px solid #666; padding-top: 8px;">
        <br>
        <b>HoD</b>
      </div>
    </td>
    <td style="border: none; text-align: right; width: 25%; padding: 10px; vertical-align: top;">
      <div style="border-top: 1px solid #666; padding-top: 8px;">
        <b>{tt['signatures']['Dean'].split(' (')[0]}</b><br>
        {sig_dean_title}
      </div>
    </td>
  </tr>
</table>
"""

    # Build complete markdown content
    content = f"""# BIRLA INSTITUTE OF TECHNOLOGY MESRA
## RANCHI, RANCHI - 835215
### STUDENT TIME TABLE - {m["academic_term"]}
**w.e.f:** {m["wef_date"]}

---

### **Class Details & Metadata**
* **Department:** {m["department"]}
* **Program:** {m["program"]}
* **Branch:** {m["branch"]}
* **Semester:** {m["semester"]}

---

### **Time Table**

{styled_table}

---

### **Course & Faculty Information**

{course_list_str}

---

### **Approvals & Signatures**

{sig_str}
"""

    with open(filepath, "w") as f:
        f.write(content)
    print(f"Successfully generated {filename} at {filepath}")
