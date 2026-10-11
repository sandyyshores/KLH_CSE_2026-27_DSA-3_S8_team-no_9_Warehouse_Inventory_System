#!/usr/bin/env python3
"""Project documentation in the 2026-27 DSA-3 format + department guidelines."""

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor, Emu
from docx.enum.section import WD_ORIENT

OUT = "/home/user/stockflow/Warehouse_Inventory_System_Project_Documentation.docx"
FIG = "/home/user/stockflow/docs/figures"
SHOT = "/home/user/stockflow/docs/screenshots"
LOGO = "/home/user/stockflow/docs/format_extract/p1_1.jpg"
BANNER = "/home/user/stockflow/docs/format_extract/p1_2.jpg"

BLUE = RGBColor(0x2E, 0x75, 0xB6)
NAVY = RGBColor(0x1F, 0x4E, 0x79)
RED = RGBColor(0xC0, 0x00, 0x00)

TEAM = [
    ("Santhosh Pendyala", "2520030330"),
    ("Haadi Hasil", "2520030297"),
    ("Sashank Chivukula", "2520030405"),
]
GUIDE = "Dr. V Sireesha"
HOD = "Dr. P. Venkateshwara Rao"
TITLE = "Warehouse Inventory System"
TEAM_NO = "9"
SECTION = "S8"


def set_run_font(run, size=12, bold=False, italic=False):
    run.bold = bold
    run.italic = italic
    run.font.name = "Times New Roman"
    run.font.size = Pt(size)
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(a), "Times New Roman")


def shade(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def add_page_field(paragraph):
    run = paragraph.add_run()
    set_run_font(run, 12)
    r = run._r
    fc1 = OxmlElement("w:fldChar"); fc1.set(qn("w:fldCharType"), "begin")
    inst = OxmlElement("w:instrText"); inst.set(qn("xml:space"), "preserve"); inst.text = " PAGE "
    fc2 = OxmlElement("w:fldChar"); fc2.set(qn("w:fldCharType"), "end")
    r.append(fc1); r.append(inst); r.append(fc2)


def set_section_margins(section):
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.left_margin = Inches(1.5)
    section.right_margin = Inches(1.25)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)


def set_page_border(section):
    """Black page border as on the 2026-27 format cover / declaration / certificate."""
    sectPr = section._sectPr
    for child in list(sectPr):
        if child.tag == qn("w:pgBorders"):
            sectPr.remove(child)
    pgBorders = OxmlElement("w:pgBorders")
    pgBorders.set(qn("w:offsetFrom"), "page")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "24")  # 3 pt
        el.set(qn("w:space"), "18")
        el.set(qn("w:color"), "000000")
        pgBorders.append(el)
    sectPr.append(pgBorders)


def set_cell_borders(cell, sz="12"):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:tcBorders")):
        tcPr.remove(old)
    borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), sz)
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "000000")
        borders.append(el)
    tcPr.append(borders)


def start_page_numbers(section, start=1):
    sectPr = section._sectPr
    for child in list(sectPr):
        if child.tag == qn("w:pgNumType"):
            sectPr.remove(child)
    pg = OxmlElement("w:pgNumType")
    pg.set(qn("w:start"), str(start))
    sectPr.append(pg)
    footer = section.footer
    footer.is_linked_to_previous = False
    p = footer.paragraphs[0]
    p.clear()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_field(p)


def no_page_numbers(section):
    footer = section.footer
    footer.is_linked_to_previous = False
    p = footer.paragraphs[0]
    p.clear()


class Doc:
    def __init__(self):
        self.d = Document()
        set_section_margins(self.d.sections[0])
        set_page_border(self.d.sections[0])
        no_page_numbers(self.d.sections[0])
        n = self.d.styles["Normal"]
        n.font.name = "Times New Roman"
        n.font.size = Pt(12)
        n.paragraph_format.line_spacing = 1.5
        n.paragraph_format.space_after = Pt(8)
        n.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        rPr = n.element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = OxmlElement("w:rFonts")
            rPr.append(rFonts)
        rFonts.set(qn("w:ascii"), "Times New Roman")
        rFonts.set(qn("w:hAnsi"), "Times New Roman")

    def p(self, text, *, size=12, bold=False, italic=False, align="justify", before=0, after=8, first=None, color=None, spacing=1.5):
        para = self.d.add_paragraph()
        para.paragraph_format.line_spacing = spacing
        para.paragraph_format.space_before = Pt(before)
        para.paragraph_format.space_after = Pt(after)
        para.alignment = {
            "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
            "center": WD_ALIGN_PARAGRAPH.CENTER,
            "left": WD_ALIGN_PARAGRAPH.LEFT,
            "right": WD_ALIGN_PARAGRAPH.RIGHT,
        }[align]
        if first is not None:
            para.paragraph_format.first_line_indent = Inches(first)
        run = para.add_run(text)
        set_run_font(run, size=size, bold=bold, italic=italic)
        if color is not None:
            run.font.color.rgb = color
        return para

    def picture(self, path, width):
        para = self.d.add_paragraph()
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        para.paragraph_format.space_before = Pt(2)
        para.paragraph_format.space_after = Pt(4)
        para.paragraph_format.line_spacing = 1.0
        run = para.add_run()
        run.add_picture(path, width=Inches(width))
        return para

    def chapter(self, text):
        """Main/Chapter heading — 16 Bold."""
        self.p(text, size=16, bold=True, align="left", before=0, after=12)

    def para_h(self, text):
        """Paragraph heading — 14 Bold."""
        self.p(text, size=14, bold=True, align="left", before=12, after=6)

    def sec_h(self, text):
        """Section / subsection — 12 Bold."""
        self.p(text, size=12, bold=True, align="left", before=10, after=4)

    def br(self):
        self.d.add_page_break()

    def fig(self, path, caption, width=5.35):
        """Boxed image with a consistent 'Fig. X.X …' caption underneath (format p.9)."""
        table = self.d.add_table(1, 1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_borders(cell, sz="12")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.0
        run = p.add_run()
        run.add_picture(path, width=Inches(width))
        self.p(caption, size=12, italic=False, align="center", before=4, after=14, spacing=1.0)

    def cell(self, cell, text, header=False):
        cell.text = ""
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if header else WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(str(text))
        set_run_font(run, size=11, bold=header)
        if header:
            shade(cell, "2C5242")
            run.font.color.rgb = RGBColor(255, 255, 255)

    def table(self, headers, rows):
        t = self.d.add_table(1 + len(rows), len(headers))
        t.style = "Table Grid"
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, h in enumerate(headers):
            self.cell(t.rows[0].cells[i], h, header=True)
        for r, row in enumerate(rows):
            for c, v in enumerate(row):
                self.cell(t.rows[r + 1].cells[c], v)
        self.d.add_paragraph()

    def code(self, text):
        para = self.d.add_paragraph()
        para.paragraph_format.line_spacing = 1.15
        para.paragraph_format.space_after = Pt(10)
        para.paragraph_format.left_indent = Inches(0.3)
        para.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = para.add_run(text)
        set_run_font(run, size=11)
        run.font.name = "Courier New"
        rPr = run._element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = OxmlElement("w:rFonts")
            rPr.append(rFonts)
        for a in ("w:ascii", "w:hAnsi"):
            rFonts.set(qn(a), "Courier New")

    def names_line(self, sep=" : "):
        return "\n".join(f"{n}{sep}{r}" for n, r in TEAM)

    # ---------- front matter ----------
    def cover(self):
        self.p(f"“{TITLE}”", size=20, bold=True, align="center", before=0, after=6, color=BLUE, spacing=1.0)
        self.p("Project Report submitted for the partial fulfilment of grade for the course",
               size=12, italic=True, align="center", after=4, spacing=1.0)
        self.p("Data Structures and Algorithms -3 (25CS2103E)", size=14, bold=True, align="center", after=6, spacing=1.0)
        self.p("in", size=12, align="center", after=4, spacing=1.0)
        self.p("DEPARTMENT OF COMPUTER SCIENCE ENGINEERING", size=13, bold=True, align="center", after=8, color=NAVY, spacing=1.0)
        self.p("by", size=12, align="center", after=6, spacing=1.0)
        for n, r in TEAM:
            self.p(f"{n}     :{r}", size=13, bold=True, align="center", after=0, spacing=1.0)
        self.p("", after=4, spacing=1.0)
        self.p(f"Team Number: {TEAM_NO}", size=12, align="center", after=0, spacing=1.0)
        self.p(f"Section: {SECTION}", size=12, align="center", after=8, spacing=1.0)
        self.p("Under the Guidance of", size=12, align="center", after=4, spacing=1.0)
        self.p(GUIDE, size=14, bold=True, align="center", after=0, color=RED, spacing=1.0)
        self.p("Associate Professor", size=13, bold=True, align="center", after=0, spacing=1.0)
        self.p("Department of Computer Science and Engineering", size=12, bold=True, align="center", after=6, color=NAVY, spacing=1.0)
        self.picture(LOGO, 2.15)
        self.picture(BANNER, 5.2)
        self.p("2026-27", size=14, bold=True, align="center", before=2, after=0, spacing=1.0)
        self.br()

    def declaration(self):
        self.picture(BANNER, 5.4)
        self.p("DEPARTMENT OF COMPUTER SCIENCE ENGINEERING", size=14, bold=True, align="center", before=10, after=22, spacing=1.15)
        self.p("Declaration", size=16, bold=True, align="center", after=18, spacing=1.15)
        names = ", ".join(f"{n} – {r}" for n, r in TEAM)
        self.p(
            f"The Project Report entitled “{TITLE}” is a record of Bonafide work of {names} "
            "submitted in partial fulfillment for the award of B. Tech in Computer Science and "
            "Engineering. The results embodied in this report have not been copied from any other "
            "departments/University/Institute."
        )
        self.p("", after=40)
        for n, r in TEAM:
            self.p(f"{n} – {r}", size=12, bold=True, align="right", after=4)
        self.br()

    def certificate(self):
        self.picture(BANNER, 5.4)
        self.p("DEPARTMENT OF COMPUTER SCIENCE ENGINEERING", size=14, bold=True, align="center", before=10, after=18, spacing=1.15)
        self.p("CERTIFICATE", size=16, bold=True, align="center", after=18, spacing=1.15)
        names = ", ".join(f"{n.upper()} – {r}" for n, r in TEAM)
        self.p(
            f"This is to certify that the mini project based report entitled “{TITLE}” is a bonafide "
            f"work done and submitted by {names} in partial fulfillment of the requirements for the "
            "award of the degree of BACHELOR OF TECHNOLOGY in Department of Computer Science "
            "Engineering, during the academic year 2026-27."
        )
        self.p("", after=56)
        t = self.d.add_table(2, 2)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl = t._tbl
        tblPr = tbl.tblPr
        borders = OxmlElement("w:tblBorders")
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            el = OxmlElement(f"w:{edge}")
            el.set(qn("w:val"), "nil")
            el.set(qn("w:sz"), "0")
            el.set(qn("w:space"), "0")
            el.set(qn("w:color"), "auto")
            borders.append(el)
        tblPr.append(borders)
        pairs = [
            ("Signature of the Guide", f"({GUIDE})"),
            ("Signature of the HOD", f"({HOD})"),
        ]
        for col, (label, name) in enumerate(pairs):
            t.rows[0].cells[col].text = ""
            p0 = t.rows[0].cells[col].paragraphs[0]
            p0.alignment = WD_ALIGN_PARAGRAPH.LEFT if col == 0 else WD_ALIGN_PARAGRAPH.RIGHT
            r0 = p0.add_run(label)
            set_run_font(r0, 12, bold=True)
            t.rows[1].cells[col].text = ""
            p1 = t.rows[1].cells[col].paragraphs[0]
            p1.alignment = WD_ALIGN_PARAGRAPH.LEFT if col == 0 else WD_ALIGN_PARAGRAPH.RIGHT
            r1 = p1.add_run(name)
            set_run_font(r1, 12)
        self.p("", after=36)
        self.p("Signature of the External Examiner", size=12, bold=True, align="center", after=0)
        self.br()

    def acknowledgement(self):
        self.p("ACKNOWLEDGEMENT", size=16, bold=True, align="center", before=8, after=22, color=RED)
        self.p(
            f"We express our sincere gratitude to our project guide {GUIDE}, Associate Professor, "
            "Department of Computer Science and Engineering, for her guidance, reviews and insistence "
            "that every algorithm in the Data Structures and Algorithms -3 syllabus appear as a "
            "warehouse operation rather than as an isolated exercise. This report and the running "
            "system both exist in that shape because of that direction."
        )
        self.p(
            f"We thank {HOD}, Associate Professor, Head of the Department of Computer Science and "
            "Engineering, for the academic environment in which this mini project could be completed, "
            "and for the department’s emphasis on documenting work in the prescribed 2026-27 format. "
            "We are also grateful to the faculty of the department for the course 25CS2103E, which "
            "supplied the techniques implemented here."
        )
        self.p(
            "Finally we thank our teammates for the shared design decisions — two URLs, hub-level "
            "stock, and a four-tab warehouse — that kept the product short enough to demonstrate in a viva."
        )
        self.p("", after=24)
        for n, r in TEAM:
            self.p(f"{n} – {r}", size=12, bold=True, align="right", after=4)
        self.br()

    def abstract(self):
        self.p("Abstract", size=16, bold=True, align="center", after=18)
        self.p(
            "The Warehouse Inventory System is an algorithm-driven application built to manage product "
            "inventory and supplier coordination across a multi-hub warehouse. Large catalogues make "
            "exact-match search brittle, restocking guesswork expensive, supplier allocation opaque, "
            "and pick-wave timing NP-hard. This mini project addresses those four problems with named "
            "techniques from Data Structures and Algorithms -3 (25CS2103E) [1], [2]."
        )
        self.p(
            "Exact SKU and name lookup uses Knuth–Morris–Pratt and Rabin–Karp string matching [3], [4]. "
            "Misspelt queries fall through to Wagner–Fischer edit distance [5]. Restock lots under a "
            "rupee cap are chosen by 0/1 knapsack dynamic programming [1], [11]. Suppliers and hubs form "
            "a flow network solved by Edmonds–Karp [6], [7]; Kuhn matching assigns suppliers to warehouses "
            "and seeds the dock schedule [8]. Pick makespan on m docks is P||Cmax; a matching-based "
            "2-approximation plus longest-processing-time list scheduling [9] produces the Floor dock "
            "board. Cycle counts draw a uniform subset of SKUs with Vitter’s reservoir algorithm R [10]."
        )
        self.p(
            "The implemented system is a single-page web application with two entry URLs that share one "
            "ledger: “/” (or “/shop”) is the wholesale storefront (selling price, cart, deliver-to hub, "
            "my orders) and “/admin” is the warehouse (Catalog, Stock, Buying, Floor). Checkout cuts "
            "hub-level quantity immediately and inserts pick jobs. Cancel restores stock; Packed completes "
            "a pick; stock can be moved between five Indian hubs. The result is a complete, viva-ready "
            "loop in which every syllabus topic has a corresponding warehouse action."
        )
        self.br()

    def toc(self):
        self.p("Table of Contents", size=16, bold=True, align="center", after=16)
        rows = [
            ("Acknowledgement", ""),
            ("Abstract", ""),
            ("Table of Contents", ""),
            ("List of Figures", ""),
            ("1  Introduction", "1"),
            ("     1.1  Overview", "1"),
            ("     1.2  Problem statement", "2"),
            ("     1.3  Scope of the project", "3"),
            ("     1.4  Objectives", "3"),
            ("2  System Requirements", "5"),
            ("     2.1  Functional Requirements", "5"),
            ("     2.2  Non-Functional Requirements", "6"),
            ("     2.3  Hardware and software specifications", "6"),
            ("3  System Design", "8"),
            ("     3.1  High-level Architecture Diagram", "8"),
            ("     3.2  Description of each layer", "9"),
            ("4  Implementation", "11"),
            ("     4.1  Module-wise implementation", "11"),
            ("     4.2  Front-end logic (UI rendering, state management)", "13"),
            ("     4.3  Application interface (shared ledger)", "13"),
            ("     4.4  Pseudocode of core algorithms", "14"),
            ("5  Results", "17"),
            ("6  Challenges & Limitations", "19"),
            ("     6.1  Issues faced during development", "19"),
            ("     6.2  Solutions applied", "19"),
            ("     6.3  Limitations of the System", "20"),
            ("7  Conclusion & Future Work", "21"),
            ("     7.1  Conclusion", "21"),
            ("     7.2  Future Work", "21"),
            ("     7.3  Skills learned during development", "22"),
            ("References", "23"),
        ]
        for title, page in rows:
            para = self.d.add_paragraph()
            para.paragraph_format.line_spacing = 1.5
            para.paragraph_format.space_after = Pt(0)
            para.paragraph_format.space_before = Pt(0)
            para.paragraph_format.tab_stops.add_tab_stop(
                Inches(5.6), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS
            )
            run = para.add_run(f"{title}\t{page}")
            set_run_font(run, 12, bold=not title.startswith(" "))
        self.br()

    def lof(self):
        self.p("List of Figures", size=16, bold=True, align="center", after=16)
        items = [
            ("1.1  Shop and warehouse sharing one catalogue", "2"),
            ("1.2  Operational flow of the system", "2"),
            ("3.1  High-level architecture", "8"),
            ("3.2  Search pipeline (KMP → Rabin–Karp → edit distance)", "10"),
            ("5.1  Meridian wholesale shop (URL / )", "17"),
            ("5.2  Live search for “ssd” listing both SSDs", "17"),
            ("5.3  Product sheet and Add to cart", "18"),
            ("5.4  Cart, deliver-to hub and Place order", "18"),
            ("5.5  My orders after checkout", "18"),
            ("5.6  Warehouse Catalog (URL /admin)", "19"),
            ("5.7  Warehouse Stock cards with hub quantity", "19"),
            ("5.8  Buying — 0/1 knapsack restock", "19"),
            ("5.9  Floor dock board (P||Cmax schedule)", "20"),
            ("5.10 Cycle-count sample (reservoir sampling)", "20"),
        ]
        for t, p in items:
            para = self.d.add_paragraph()
            para.paragraph_format.line_spacing = 1.5
            para.paragraph_format.space_after = Pt(0)
            para.paragraph_format.tab_stops.add_tab_stop(
                Inches(5.6), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS
            )
            run = para.add_run(f"{t}\t{p}")
            set_run_font(run, 12)
        self.br()

    # ---------- numbered chapters (page nos start) ----------
    def begin_body(self):
        self.d.add_section()
        set_section_margins(self.d.sections[1])
        # body pages in the format sample have no page border
        sectPr = self.d.sections[1]._sectPr
        for child in list(sectPr):
            if child.tag == qn("w:pgBorders"):
                sectPr.remove(child)
        start_page_numbers(self.d.sections[1], 1)

    def ch1(self):
        self.chapter("1. INTRODUCTION")
        self.para_h("1.1 Overview")
        self.p(
            "A working warehouse is several textbook problems at once. Staff type a half-remembered "
            "product name; a wholesale buyer expects the quantity just purchased to leave the book; "
            "purchasing has a rupee cap and a list of SKUs below minimum stock; docks must finish "
            "today’s picks before the last truck leaves. In computer science, a data structure is a "
            "way to organize and store data that is usually chosen for efficient access to data [1]. "
            "The same sentence applies to a warehouse: the catalogue, the hub vector of quantities, "
            "the pick list and the supplier graph are data structures, and the operations on them are "
            "the algorithms taught in 25CS2103E."
        )
        self.p(
            "This mini project, titled Warehouse Inventory System, implements those operations in a "
            "browser application branded Meridian. Buyers enter at “/” or “/shop” and see selling "
            "price (MRP), a cart and a deliver-to hub. Warehouse staff enter at “/admin” and see "
            "Catalog, Stock, Buying and Floor. Both sides share one product ledger. Fig. 1.1 shows "
            "that split; Fig. 1.2 shows the operational path from search to count."
        )
        self.fig(f"{FIG}/fig_1_1.png", "Fig. 1.1 Shop and warehouse sharing one catalogue")
        self.fig(f"{FIG}/fig_1_2.png", "Fig. 1.2 Operational flow of the system")
        self.p(
            "The remainder of this chapter states the problem, the scope and the objectives. "
            "Chapter 2 lists requirements. Chapter 3 describes architecture. Chapter 4 records "
            "module-wise implementation and pseudocode. Chapter 5 presents results. Chapter 6 "
            "records challenges. Chapter 7 concludes."
        )

        self.para_h("1.2 Problem statement")
        self.p(
            "Current warehouse inventory systems, especially teaching and small-business tools, "
            "typically fail in combination [2]:"
        )
        self.p(
            "Slow, exact-match-only product searching that misses a SKU fragment or a typo; "
            "sub-optimal restocking under a hard budget; inefficient manual supplier-to-hub "
            "coordination with no view of bottlenecks; no treatment of NP-hard pick scheduling; "
            "cycle counts that always inspect the same convenient SKUs; and a split between the "
            "shop a buyer sees and the stock a warehouse sees, so a sale does not move the book."
        )
        self.p(
            "The problem addressed by this work is to design and implement a warehouse inventory "
            "system in which search, restock, supplier allocation, pick scheduling and audits are "
            "performed by named DSA-3 algorithms, and in which a wholesale buyer and a warehouse "
            "operator share one live catalogue split across five hubs."
        )

        self.para_h("1.3 Scope of the project")
        self.p(
            "In scope: a demonstration catalogue of about forty-eight SKUs, five hubs (Hyderabad, "
            "Mumbai, Chennai, Gurugram, Bengaluru), six suppliers and four docks; the full search "
            "pipeline; knapsack restock; Edmonds–Karp flow and Kuhn matching; matching-based pick "
            "scheduling; reservoir cycle counts; hub-level stock, substitutes, cancel, pack, transfer "
            "and a printable pick list; two URLs; no backend server."
        )
        self.p(
            "Out of scope by design: authentication, payment gateways, street-level addresses and a "
            "production database. Identity on the shop is a company dropdown; deliver-to is a hub. "
            "Persistence is a browser ledger so that “/” and “/admin” remain consistent across refresh "
            "and across two tabs. Those limits keep the viva on algorithms rather than on operations."
        )

        self.para_h("1.4 Objectives")
        self.p("The objectives, carried through to the running application, are:")
        self.p(
            "1. Product search — exact matching with KMP and Rabin–Karp [3], [4] and fuzzy matching "
            "with Wagner–Fischer edit distance [5], including live catalogue filter and optional typeahead."
        )
        self.p(
            "2. Optimal restocking using 0/1 knapsack dynamic programming [1] under a typed spend cap, "
            "with purchase orders that raise hub stock."
        )
        self.p(
            "3. Supplier flow-network modelling with Edmonds–Karp [6] and min-cut bottleneck detection, "
            "plus bipartite assignment of suppliers to hubs with Kuhn’s algorithm [8]."
        )
        self.p(
            "4. NP-hard order scheduling via a matching-based 2-approximation for P||Cmax [9], with a "
            "dock board, hub filter, Packed action and printable pick list."
        )
        self.p(
            "5. Randomised cycle counts via reservoir sampling [10], with posted counts writing back to the book."
        )
        self.p(
            "6. A buyer storefront and a warehouse console on two URLs sharing one ledger: MRP versus "
            "unit cost, deliver-to hub, immediate stock cut on checkout, cancel-to-restore, pack-to-complete, "
            "and hub-to-hub transfer. The product UI does not display student names, roll numbers or the guide."
        )

    def ch2(self):
        self.chapter("2. SYSTEM REQUIREMENTS")
        self.p(
            "This chapter records what the system must do and under what constraints, including a "
            "brief note on prior work. Traditional WMS products answer search with SQL LIKE, restock "
            "with human judgement and ignore makespan bounds [2]. Basic scripts scan strings in O(n·m). "
            "RFID stacks improve identity capture but not allocation. The gap this project fills is "
            "the combination of typo-tolerant search, budget-optimal restock, max-flow supplier analysis "
            "and a 2-approximation for pick makespan in one inspectable application."
        )
        self.para_h("2.1 Functional Requirements")
        self.p("FR1  A user on “/” can search, browse, add to cart, choose a deliver-to hub, place an order and cancel it.")
        self.p("FR2  A user on “/admin” can search the same catalogue, adjust stock per hub, run buying, inspect supplier flow, schedule picks, pack picks, print a pick list and post a cycle count.")
        self.p("FR3  Placing an order decrements quantity at the chosen hub and appends Floor pick jobs immediately.")
        self.p("FR4  Search returns both SSD SKUs for the query “ssd”, does not auto-pick a suggestion on Enter, and tolerates mild typos.")
        self.p("FR5  Restock honours a spend cap; decreasing the amount does not force a zero or trap the caret.")
        self.p("FR6  Stock can be moved between hubs; Packed greys a pick and removes it from the dock board.")
        self.p("FR7  Demo data can be reset without reinstalling the application.")
        self.para_h("2.2 Non-Functional Requirements")
        self.p("NFR1  Usability: the warehouse has four tabs only (Catalog, Stock, Buying, Floor); the shop has Shop, Cart and My orders.")
        self.p("NFR2  Reliability of the ledger: shop and admin show the same on-hand numbers after a sale, a restock, a move or a cancel, including across two browser tabs.")
        self.p("NFR3  Scalability of algorithms: KMP and reservoir are linear in catalogue size; knapsack is O(n·W); Edmonds–Karp is polynomial on the small supplier graph [1], [6], [10].")
        self.p("NFR4  Response time: search and checkout complete in interactive time on a dual-core machine with 4 GB RAM for the demonstration catalogue.")
        self.p("NFR5  Maintainability: each algorithm lives in src/algorithms/ as a pure function so that a viva can open one file per question.")
        self.para_h("2.3 Hardware and software specifications")
        self.table(["Item", "Minimum", "Recommended"], [
            ["Processor", "Intel i3 / AMD Ryzen 3, dual-core", "Quad-core"],
            ["RAM", "4 GB", "8 GB (large knapsack W)"],
            ["Storage", "500 MB free", "1 GB free"],
            ["Display", "1366 × 768", "1920 × 1080"],
        ])
        self.p(
            "Software: Windows 10/11, macOS or Linux; Node.js 20 or newer; a current Chrome, Edge, "
            "Firefox or Safari browser; Visual Studio Code; Git. The implementation language is "
            "JavaScript (ES modules) with React 19 and Vite 8. There is no database server and no "
            "authentication or payment service. The original proposal mentioned Java; the delivered "
            "system is a web SPA so that shop and warehouse can share one process, which is required "
            "by FR3."
        )

    def ch3(self):
        self.chapter("3. SYSTEM DESIGN")
        self.para_h("3.1 High-level Architecture Diagram")
        self.p(
            "The application is a single React tree. A pathname router renders the shop or the "
            "warehouse. Both read and write one StoreProvider. Mutations persist to localStorage and "
            "broadcast to other tabs. There is no REST backend. Fig. 3.1 is the architecture; Fig. 3.2 "
            "is the search pipeline inside Catalog and Shop."
        )
        self.fig(f"{FIG}/fig_3_1.png", "Fig. 3.1 High-level architecture")
        self.fig(f"{FIG}/fig_3_2.png", "Fig. 3.2 Search pipeline (KMP → Rabin–Karp → edit distance)")
        self.para_h("3.2 Description of each layer")
        self.sec_h("Presentation layer")
        self.p(
            "ShopLayout owns search, deliver-to city, company dropdown, cart and My orders. Layout "
            "owns the four admin tabs, the low-stock and picks pills, and Reset demo. Product cards "
            "show the actual on-hand integer at the relevant hub so that a sale is visible without "
            "opening a modal. Floor inbound pulses, hub chips, Packed and Print sit on the existing "
            "Picks page rather than on a fifth tab."
        )
        self.sec_h("State layer")
        self.p(
            "A product carries sku, name, category, unitCost, mrp, minStock, location, home warehouseId "
            "and byHub, a map from hub id to on-hand. The scalar qty is the sum of byHub. A pick job "
            "is {id, sku, qty, processingMin, priority, customer, productName, hubId, status} with "
            "status open or packed. A buyer ticket groups lines, hub, total and pickIds. Cancel walks "
            "pickIds, restores each line to that hub and drops the jobs."
        )
        self.sec_h("Algorithm layer")
        self.p(
            "src/algorithms/ contains Knuth–Morris–Pratt [3], Rabin–Karp [4], Wagner–Fischer [5], "
            "0/1 knapsack [1], Edmonds–Karp [6], Kuhn matching [8], the matching-based scheduler [9] "
            "and reservoir sampling [10]. src/lib/shopSearch.js sequences the three search passes. "
            "src/lib/stock.js owns hub arithmetic and substitutes. Seed data is src/data/seed.js."
        )
        self.sec_h("Why these techniques are suitable")
        self.p(
            "KMP and Rabin–Karp replace O(n·m) scans for exact lookup. Edit distance is the standard "
            "model of typos. 0/1 knapsack is the right DP once restock is “take this lot or skip it” "
            "under a rupee cap. Max-flow is the right model of supplier capacity into hubs; the min-cut "
            "names the bottleneck. P||Cmax is NP-hard for m ≥ 2, so a 2-approximation is the honest "
            "algorithmic claim [9]. Reservoir sampling is the one-pass uniform sample required for an "
            "unbiased cycle count [10]."
        )

    def ch4(self):
        self.chapter("4. IMPLEMENTATION")
        self.para_h("4.1 Module-wise implementation")
        self.sec_h("Catalog / Shop search")
        self.p(
            "Keystrokes set the query, open optional suggestions and live-filter the grid. Enter "
            "searches the typed text; only a click adopts a suggestion. Exact KMP hits win; otherwise "
            "Rabin–Karp; otherwise fuzzy with a close-match flag. The shop interprets quantity at the "
            "deliver-to hub. A dry hub sheet offers other hubs and same-category substitutes."
        )
        self.sec_h("Stock")
        self.p(
            "Cards are the default (photograph, stepper, Edit, Move, Reorder) with a List toggle. "
            "Hub chips select which byHub cell the stepper edits. Move transfers a typed quantity "
            "from one hub to another. Needs-attention filters low or empty cells."
        )
        self.sec_h("Buying")
        self.p(
            "Buy builds knapsack items from SKUs below minimum (or pinned), runs DP under the spend "
            "cap and Place POs add restockQty to each home hub. Supply runs Edmonds–Karp on the "
            "source–supplier–hub–sink graph and Kuhn matching on allowed lanes."
        )
        self.sec_h("Floor")
        self.p(
            "Picks shows inbound pulses from shop checkouts, hub chips, a dock Gantt from the "
            "2-approximation, Packed (grey the row, drop from the board) and Print pick list. Counts "
            "draws k SKUs with reservoir sampling; posting writes counted quantity through the home hub."
        )
        self.sec_h("Shop cart and orders")
        self.p(
            "Add to cart does not cut stock. Place order takes min(requested, on-hand at the hub), "
            "writes byHub, prepends pick jobs, posts an inbound pulse and files a ticket. Cancel "
            "restores that hub and deletes the jobs."
        )
        self.para_h("4.2 Front-end logic (UI rendering, state management)")
        self.p(
            "React 19 function components subscribe to StoreContext. Pathname state chooses ShopLayout "
            "or Layout without remounting the provider, so in-app Warehouse → / Shop → keep the "
            "ledger. persist() snapshots products, orders, tickets and inbound. A storage listener "
            "and BroadcastChannel apply another tab’s snapshot without replacing the local cart. "
            "Typeahead is a filtered list; it is not a controlled auto-complete that hijacks Enter."
        )
        self.para_h("4.3 Application interface (shared ledger)")
        self.p(
            "There is no remote HTTP API. The store is the application interface. Callers invoke "
            "addToCart, placeOrder, cancelOrder, bumpQty, transferStock, applyRestock, packOrder, "
            "applyAuditCounts and resetDemo. That choice satisfies FR3 (a sale must update admin "
            "stock in the same process) and NFR2 (two URLs, one catalogue)."
        )
        self.para_h("4.4 Pseudocode of core algorithms")
        self.sec_h("Knuth–Morris–Pratt (exact search) [3]")
        self.code(
            "COMPUTE-LPS(pattern)\n"
            "    m ← length(pattern); lps[0..m-1] ← 0; len ← 0; i ← 1\n"
            "    while i < m\n"
            "        if pattern[i] = pattern[len] then len ← len+1; lps[i] ← len; i ← i+1\n"
            "        else if len ≠ 0 then len ← lps[len-1]\n"
            "        else lps[i] ← 0; i ← i+1\n"
            "    return lps\n"
            "KMP-SEARCH(text, pattern)\n"
            "    lps ← COMPUTE-LPS(pattern); i ← 0; j ← 0\n"
            "    while i < n\n"
            "        if text[i] = pattern[j] then i ← i+1; j ← j+1\n"
            "        if j = m then record hit; j ← lps[j-1]\n"
            "        else if i < n and text[i] ≠ pattern[j]\n"
            "            if j ≠ 0 then j ← lps[j-1] else i ← i+1"
        )
        self.p("Time is O(n + m). LPS never rewinds the text.")
        self.sec_h("0/1 knapsack restock [1]")
        self.code(
            "KNAPSACK(items[1..n], W)\n"
            "    for i ← 0 to n do for c ← 0 to W do dp[i][c] ← 0; take[i][c] ← false\n"
            "    for i ← 1 to n\n"
            "        for c ← 0 to W\n"
            "            dp[i][c] ← dp[i-1][c]\n"
            "            if w_i ≤ c and dp[i-1][c-w_i] + v_i > dp[i][c]\n"
            "                dp[i][c] ← dp[i-1][c-w_i] + v_i; take[i][c] ← true\n"
            "    reconstruct selected items from take[n][W]"
        )
        self.p("Time and memory are O(n·W). Value is urgency × units-short × demand; weight is restock cost in rupees.")
        self.sec_h("Edmonds–Karp max-flow [6]")
        self.code(
            "EDMONDS-KARP(G, s, t)\n"
            "    flow ← 0\n"
            "    while BFS finds an s–t path P in the residual graph\n"
            "        Δ ← min residual capacity on P\n"
            "        augment P by Δ; flow ← flow + Δ\n"
            "    min-cut ← vertices reachable from s in the residual graph\n"
            "    return flow, min-cut"
        )
        self.p("Time is O(V·E²). Saturated edges leaving the source side are bottleneck suppliers.")
        self.sec_h("Matching-based 2-approximation for P||Cmax [9]")
        self.code(
            "SCHEDULE(jobs, m docks)\n"
            "    LB ← max( max p_j ,  ceil(Σ p_j / m) )\n"
            "    match the m longest jobs onto docks with Kuhn (prefer faster docks)\n"
            "    for remaining jobs in LPT order\n"
            "        assign to the currently least-loaded dock (time / speed)\n"
            "    return assignment, Cmax"
        )
        self.p("Any list schedule on identical machines satisfies Cmax ≤ 2·OPT. Packed jobs leave the instance; hub chips restrict it to one city.")
        self.sec_h("Reservoir sampling, Algorithm R [10]")
        self.code(
            "RESERVOIR(stream, k)\n"
            "    R ← first k items\n"
            "    for i ← k+1 to n\n"
            "        j ← random integer in 1..i\n"
            "        if j ≤ k then R[j] ← stream[i]\n"
            "    return R          // P(item in R) = k/n"
        )
        self.p("Time is O(n), one pass. The Counts tab uses this sample as the SKUs to count.")
        self.sec_h("Place order (hub cut)")
        self.code(
            "PLACE-ORDER(cart, hub)\n"
            "    lines ← empty\n"
            "    for each (sku, qty) in cart\n"
            "        take ← min(qty, byHub[sku][hub])\n"
            "        if take > 0 then byHub[sku][hub] ← byHub[sku][hub] − take\n"
            "                        append line and a pick job (status open)\n"
            "    if lines empty then reject\n"
            "    else ticket ← {lines, hub, total}; inbound pulse ← ticket\n"
            "         persist ledger"
        )

    def ch5(self):
        self.chapter("5. RESULTS")
        self.p(
            "Results are reported against the naïve or manual baseline stated in the proposal. "
            "Table 5.1 is the comparison. Figures 5.1–5.10 are screenshots of the running Meridian "
            "application (Vite development server, Chromium, demonstration catalogue) — the wholesale "
            "shop at “/” and the warehouse at “/admin” — not schematic drawings."
        )
        self.table(
            ["Operation", "Traditional", "Implemented", "Improvement"],
            [
                ["Exact SKU/name lookup", "O(n·m) linear scan", "O(n+m) KMP / Rabin–Karp [3], [4]", "Single pass; “ssd” lists both SSDs"],
                ["Typo-tolerant search", "Not available", "Wagner–Fischer, threshold 3 [5]", "New capability"],
                ["Restock under a cap", "Manual / greedy", "O(n·W) 0/1 knapsack [1]", "Optimal for modelled value"],
                ["Supplier allocation", "Manual", "Edmonds–Karp O(V·E²) [6]; Kuhn O(V·E) [8]", "Capacity-aware; min-cut bottlenecks"],
                ["Pick scheduling", "Not available", "Matching + LPT, Cmax ≤ 2·OPT [9]", "Dock board, print list"],
                ["Cycle count sample", "Convenience sample", "Reservoir R, P = k/n [10]", "Unbiased k-subset"],
                ["Sale visibility", "Batch / next day", "Checkout cuts hub qty in the same store", "Shop and admin agree immediately"],
            ],
        )
        self.p("Table 5.1 Traditional versus implemented operations", size=12, italic=True, align="center")

        self.p(
            "Fig. 5.1 is the buyer storefront. Selling price (MRP) is shown, not warehouse unit cost. "
            "The header holds search, deliver-to city (Hyderabad), the buying company, Orders and Cart. "
            "Category chips and “Moving today” cards print the live hub count (“16 in Hyderabad”, "
            "“Out in Hyderabad”) so a sale is visible without opening a sheet."
        )
        self.fig(f"{SHOT}/shop_home.png", "Fig. 5.1 Meridian wholesale shop (URL / )")

        self.p(
            "Fig. 5.2 is the search for the typed query “ssd”. Typeahead lists both NVMe SSD SKUs "
            "while the operator is still typing; the grid live-filters to the same two cards. Enter "
            "does not auto-pick the highlighted suggestion — it searches the typed text, which is "
            "the requirement that both SSDs appear together [3], [4]."
        )
        self.fig(f"{SHOT}/shop_search_ssd.png", "Fig. 5.2 Live search for “ssd” listing both SSDs")

        self.p(
            "Fig. 5.3 is a product sheet opened from the grid (Packaging Tape 48mm). Quantity, MRP "
            "and “16 available in Hyderabad” are shown. Add to cart does not cut stock; only Place "
            "order does, matching FR3."
        )
        self.fig(f"{SHOT}/shop_product.png", "Fig. 5.3 Product sheet and Add to cart")

        self.p(
            "Fig. 5.4 is Cart. Deliver-to is a hub (Hyderabad Hub), not a street form. The toast "
            "confirms the add; Place order will decrement Hyderabad quantity and insert Floor pick "
            "jobs in the same ledger the warehouse reads."
        )
        self.fig(f"{SHOT}/shop_cart.png", "Fig. 5.4 Cart, deliver-to hub and Place order")

        self.p(
            "Fig. 5.5 is My orders after checkout. Ticket SO-627485 is filed as placed against "
            "Deccan Retail at Hyderabad. Cancel · restore stock walks the pick ids and puts the "
            "quantity back on that hub."
        )
        self.fig(f"{SHOT}/shop_orders.png", "Fig. 5.5 My orders after checkout")

        self.p(
            "Fig. 5.6 is the warehouse Catalog at “/admin”. The same photographs and SKUs appear, "
            "but the price is unit cost (₹6,200 for the 1 TB SSD versus MRP ₹7,316 on the shop) "
            "and the badge is warehouse on-hand (“9 left”). Low-stock and open-pick pills sit in "
            "the header."
        )
        self.fig(f"{SHOT}/admin_catalog.png", "Fig. 5.6 Warehouse Catalog (URL /admin)")

        self.p(
            "Fig. 5.7 is Stock. Cards match Catalog (photograph, SKU, bin) with a +/− stepper on "
            "the card, min-stock, and Edit / Move / Reorder. Hub chips select which byHub cell the "
            "stepper edits. A List toggle is available; Cards is the default."
        )
        self.fig(f"{SHOT}/admin_stock.png", "Fig. 5.7 Warehouse Stock cards with hub quantity")

        self.p(
            "Fig. 5.8 is Buying. SKUs below minimum are scored and selected by 0/1 knapsack under "
            "the typed spend cap (₹25,000). The cart on the right is the reconstructed DP solution "
            "(lots and costs); Place POs write restockQty onto each home hub [1], [11]."
        )
        self.fig(f"{SHOT}/admin_buying.png", "Fig. 5.8 Buying — 0/1 knapsack restock")

        self.p(
            "Fig. 5.9 is Floor → Picks. The dock board is the matching-based 2-approximation for "
            "P||Cmax [9]: four docks, Gantt bars sized by pick minutes, Packed completing a job. "
            "Open picks (16) and last-dock finish (148 min) are the makespan view used in the viva."
        )
        self.fig(f"{SHOT}/admin_floor.png", "Fig. 5.9 Floor dock board (P||Cmax schedule)")

        self.p(
            "Fig. 5.10 is Floor → Counts. Eight SKUs were drawn with Vitter’s reservoir algorithm R "
            "so that each catalogue item has probability k/n of appearing [10]. Post to stock writes "
            "the counted quantity through the home hub."
        )
        self.fig(f"{SHOT}/admin_counts.png", "Fig. 5.10 Cycle-count sample (reservoir sampling)")

        self.p(
            "Manual scenario tests on the Vite server (npm run dev) covered: Enter on “ssd” without "
            "auto-picking a suggestion; add-to-cart without cutting qty; Place order to Hyderabad "
            "dropping that hub and raising Floor; Stock +/− and Place POs appearing on the shop; "
            "dry-hub substitutes; cancel restoring stock; Packed greying a row; Move 6 units "
            "Hyderabad → Mumbai; reservoir k = 8 posted back to the book; Reset demo restoring seed. "
            "All of those paths passed on the demonstration catalogue."
        )
        self.p(
            "Qualitatively, a two-minute viva script — search ssd, order to Hyderabad, open /admin "
            "Floor, pack, filter Mumbai, move stock, reset — exercises every algorithm except flow, "
            "which is one click on Buying → Supply. That density comes from refusing extra pages."
        )

    def ch6(self):
        self.chapter("6. CHALLENGES & LIMITATIONS")
        self.para_h("6.1 Issues faced during development")
        self.p(
            "Two URLs were first implemented as two layouts over one React store. Opening “/” and "
            "“/admin” as separate addresses still remounted the tree and reset seed quantities, so "
            "a shop sale did not appear in admin. Catalogue cards said only “In stock”, so a drop "
            "from 42 to 38 was invisible. Enter on the search bar adopted the highlighted suggestion, "
            "so the query “ssd” never listed both SSDs. The spend field snapped to 0 and trapped the "
            "caret when the operator decreased the cap. Too many top-level pages made the warehouse "
            "feel like a folder of labs."
        )
        self.para_h("6.2 Solutions applied")
        self.p(
            "A versioned localStorage ledger plus a storage/BroadcastChannel sync keeps shop and "
            "admin on one catalogue across refresh and tabs. Cards print the integer on-hand at the "
            "hub. Enter always searches the typed query; click-only adopts a suggestion; typing also "
            "live-filters the grid. The spend box is a digit string, not a forced number. Admin was "
            "cut to four tabs with inner segments for Buying and Floor."
        )
        self.para_h("6.3 Limitations of the System")
        self.p(
            "The ledger lives in the browser; clearing site data resets history (Reset demo is "
            "intentional). Knapsack is O(n·W) in the rupee cap; an enormous budget will wait. There "
            "is no login and no payment. Flow is max-flow, not min-cost. The catalogue is teaching-"
            "scale. Those are accepted limits of a 25CS2103E mini project, not unfinished screens."
        )

    def ch7(self):
        self.chapter("7. CONCLUSION & FUTURE WORK")
        self.para_h("7.1 Conclusion")
        self.p(
            "The Warehouse Inventory System shows that the DSA-3 syllabus — string matching, dynamic "
            "programming, network flow, bipartite matching, approximation for NP-hard scheduling, and "
            "randomised sampling — can drive a warehouse and a wholesale shop rather than a folder of "
            "disconnected labs [1], [2]. Replacing exact-match search and manual tracking with these "
            "techniques improves search flexibility, restocking optimality, supplier coordination and "
            "pick makespan, with bounds that can be written on a board in the viva."
        )
        self.p(
            "The implemented application makes that claim inspectable. Two URLs share one hub-level "
            "ledger. Checkout, cancel, pack, move, knapsack purchase orders and reservoir counts all "
            "write the same products array. The interface stays operational. The report names every "
            "algorithm; the screen does not have to. The work meets the objectives in Section 1.4 "
            "within the scope in Section 1.3."
        )
        self.para_h("7.2 Future Work")
        self.p(
            "Suffix automaton or suffix-array indexing for faster multi-pattern search as the catalogue "
            "grows [1]. Min-cost max-flow for cheapest procurement rather than max-flow only. Dinic’s "
            "algorithm for larger supplier graphs [6]. Predictive restocking that feeds knapsack values "
            "from demand history. Parallel reduce for multi-hub audits. Optional staff login and a "
            "durable server ledger if the project ever leaves the laptop. None of these are required "
            "to argue that the present system meets its objectives."
        )
        self.para_h("7.3 Skills learned during development")
        self.p(
            "Implementing KMP, rolling hashes, edit distance, knapsack reconstruction, BFS augmenting "
            "paths, DFS matching, list scheduling and reservoir sampling from the recurrences, without "
            "a graph library. Mapping each of those to a screen a storekeeper would recognise. Keeping "
            "a product short (four warehouse tabs, three shop pages) while still covering the syllabus. "
            "Writing a shared ledger so that a demo on two URLs does not lie about stock. Documenting "
            "the work in the department’s 2026-27 format, with citations in the text [1]."
        )

    def refs(self):
        self.chapter("REFERENCES")
        refs = [
            "T. H. Cormen, C. E. Leiserson, R. L. Rivest and C. Stein, Introduction to Algorithms, 3rd ed. Cambridge, MA, USA: MIT Press, 2009.",
            "J. Kleinberg and É. Tardos, Algorithm Design. Boston, MA, USA: Addison-Wesley, 2006.",
            "D. E. Knuth, J. H. Morris and V. R. Pratt, “Fast pattern matching in strings,” SIAM J. Comput., vol. 6, no. 2, pp. 323–350, 1977.",
            "R. M. Karp and M. O. Rabin, “Efficient randomized pattern-matching algorithms,” IBM J. Res. Dev., vol. 31, no. 2, pp. 249–260, 1987.",
            "R. A. Wagner and M. J. Fischer, “The string-to-string correction problem,” J. ACM, vol. 21, no. 1, pp. 168–173, 1974.",
            "J. Edmonds and R. M. Karp, “Theoretical improvements in algorithmic efficiency for network flow problems,” J. ACM, vol. 19, no. 2, pp. 248–264, 1972.",
            "L. R. Ford and D. R. Fulkerson, “Maximal flow through a network,” Can. J. Math., vol. 8, pp. 399–404, 1956.",
            "H. W. Kuhn, “The Hungarian method for the assignment problem,” Naval Res. Logist. Quart., vol. 2, pp. 83–97, 1955.",
            "R. L. Graham, “Bounds on multiprocessing timing anomalies,” SIAM J. Appl. Math., vol. 17, no. 2, pp. 416–429, 1969.",
            "J. S. Vitter, “Random sampling with a reservoir,” ACM Trans. Math. Softw., vol. 11, no. 1, pp. 37–57, 1985.",
            "S. Martello and P. Toth, Knapsack Problems: Algorithms and Computer Implementations. Chichester, UK: Wiley, 1990.",
        ]
        for i, r in enumerate(refs, 1):
            para = self.d.add_paragraph()
            para.paragraph_format.left_indent = Inches(0.4)
            para.paragraph_format.first_line_indent = Inches(-0.4)
            para.paragraph_format.line_spacing = 1.5
            para.paragraph_format.space_after = Pt(8)
            para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            run = para.add_run(f"[{i}]  {r}")
            set_run_font(run, 12)

    def build(self):
        self.cover()
        self.declaration()
        self.certificate()
        self.acknowledgement()
        self.abstract()
        self.toc()
        self.lof()
        self.begin_body()
        self.ch1()
        self.ch2()
        self.ch3()
        self.ch4()
        self.ch5()
        self.ch6()
        self.ch7()
        self.refs()
        self.d.save(OUT)
        import shutil
        shutil.copy(OUT, "/home/user/Warehouse_Inventory_System_Project_Documentation.docx")
        print("wrote", OUT)


if __name__ == "__main__":
    Doc().build()
