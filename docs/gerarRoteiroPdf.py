from pathlib import Path
from datetime import datetime

from PIL import Image as PILImage, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


BASE_DIR = Path("docs")
ASSETS_DIR = BASE_DIR / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)


def get_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        candidate_path = Path(candidate)
        if candidate_path.exists():
            return ImageFont.truetype(str(candidate_path), size)
    return ImageFont.load_default()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = (current + " " + word).strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def build_image_architecture(path_out: Path):
    font_title = get_font(44)
    font_sub = get_font(26)
    font_box = get_font(28)
    font_small = get_font(22)

    image = PILImage.new("RGB", (1800, 1000), color=(16, 18, 24))
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, 1799, 120), fill=(27, 34, 51))
    draw.text((60, 30), "Arquitetura por Camadas do Projeto Filosofia", font=font_title, fill=(236, 221, 176))
    draw.text(
        (60, 140),
        "Fluxo principal: Front-end -> Rotas -> Controllers -> Models -> Banco",
        font=font_sub,
        fill=(220, 220, 220),
    )

    boxes = [
        ("Front-end\nHTML/CSS/JS", (80, 300, 360, 560), (70, 95, 145)),
        ("Routes\nExpress", (420, 300, 700, 560), (63, 125, 88)),
        ("Controllers\nRegras", (760, 300, 1040, 560), (145, 89, 49)),
        ("Models\nSQL", (1100, 300, 1380, 560), (99, 61, 140)),
        ("MySQL\nDados", (1440, 300, 1720, 560), (54, 104, 114)),
    ]

    for text, box, color in boxes:
        draw.rounded_rectangle(box, radius=28, fill=color, outline=(230, 230, 230), width=3)
        lines = text.split("\n")
        y = box[1] + 75
        for line in lines:
            bb = draw.textbbox((0, 0), line, font=font_box)
            tw = bb[2] - bb[0]
            draw.text((box[0] + (box[2] - box[0] - tw) / 2, y), line, font=font_box, fill=(255, 255, 255))
            y += 58

    for index in range(len(boxes) - 1):
        x1 = boxes[index][1][2] + 10
        y1 = (boxes[index][1][1] + boxes[index][1][3]) // 2
        x2 = boxes[index + 1][1][0] - 10
        y2 = (boxes[index + 1][1][1] + boxes[index + 1][1][3]) // 2
        draw.line((x1, y1, x2, y2), fill=(236, 221, 176), width=7)
        draw.polygon([(x2, y2), (x2 - 20, y2 - 12), (x2 - 20, y2 + 12)], fill=(236, 221, 176))

    legend = [
        "- Front-end: mostra telas e envia fetch.",
        "- Routes: define caminhos HTTP.",
        "- Controllers: validam dados e regras.",
        "- Models: executam SQL parametrizado.",
        "- MySQL: armazena dados do projeto.",
    ]

    y_legend = 650
    for line in legend:
        draw.text((120, y_legend), line, font=font_small, fill=(227, 227, 227))
        y_legend += 52

    image.save(path_out)


def build_image_discovery_flow(path_out: Path):
    font_title = get_font(44)
    font_box_title = get_font(30)
    font_small = get_font(22)

    image = PILImage.new("RGB", (1800, 1100), color=(18, 18, 22))
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, 1799, 120), fill=(38, 32, 62))
    draw.text((60, 30), "Fluxo da Descoberta (Questionario)", font=font_title, fill=(241, 218, 160))

    steps = [
        (
            "1) Abrir descoberta",
            "Front chama GET /descoberta/proxima-pergunta para buscar a pendente.",
            (63, 86, 133),
        ),
        (
            "2) Validar sessao",
            "Com sessao: retorna pergunta pendente. Sem sessao: pergunta publica.",
            (64, 120, 94),
        ),
        (
            "3) Renderizar opcoes",
            "Usuario escolhe alternativa e front envia somente idAlternativa.",
            (132, 89, 54),
        ),
        (
            "4) Registrar resposta",
            "POST /descoberta/responder valida pergunta pendente e resposta unica.",
            (120, 66, 120),
        ),
        (
            "5) Avancar progresso",
            "Front mostra continuar e repete ate completar perguntas ativas.",
            (78, 107, 122),
        ),
        (
            "6) Mostrar resultado",
            "GET /descoberta/meu-resultado soma pesos por corrente filosofica.",
            (106, 90, 48),
        ),
    ]

    def step_box(y_top: int, title: str, desc: str, color):
        box = (180, y_top, 1620, y_top + 130)
        draw.rounded_rectangle(box, radius=22, fill=color, outline=(240, 240, 240), width=2)
        draw.text((220, y_top + 18), title, font=font_box_title, fill=(255, 255, 255))
        lines = wrap_text(draw, desc, font_small, 1320)
        y_text = y_top + 66
        for line in lines[:2]:
            draw.text((220, y_text), line, font=font_small, fill=(245, 245, 245))
            y_text += 30
        return box

    y_cursor = 180
    previous = None
    for title, desc, color in steps:
        current_box = step_box(y_cursor, title, desc, color)
        if previous:
            x = 900
            draw.line((x, previous[3] + 8, x, current_box[1] - 8), fill=(241, 218, 160), width=6)
            draw.polygon([(x, current_box[1] - 8), (x - 12, current_box[1] - 28), (x + 12, current_box[1] - 28)], fill=(241, 218, 160))
        previous = current_box
        y_cursor += 150

    image.save(path_out)


def register_pdf_font():
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        candidate_path = Path(candidate)
        if candidate_path.exists():
            pdfmetrics.registerFont(TTFont("DocFont", str(candidate_path)))
            return "DocFont"
    return "Helvetica"


def build_pdf(pdf_path: Path, architecture_image: Path, discovery_image: Path):
    font_name = register_pdf_font()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="DocTitle", parent=styles["Heading1"], fontName=font_name, fontSize=20, leading=24, alignment=TA_CENTER, spaceAfter=10))
    styles.add(ParagraphStyle(name="DocSub", parent=styles["Normal"], fontName=font_name, fontSize=11, leading=14, alignment=TA_CENTER, textColor=colors.grey))
    styles.add(ParagraphStyle(name="DocH2", parent=styles["Heading2"], fontName=font_name, fontSize=14, leading=18, spaceAfter=6, spaceBefore=12))
    styles.add(ParagraphStyle(name="DocBody", parent=styles["Normal"], fontName=font_name, fontSize=10.5, leading=14, alignment=TA_LEFT))
    styles.add(ParagraphStyle(name="DocNote", parent=styles["Normal"], fontName=font_name, fontSize=9.5, leading=12, textColor=colors.HexColor("#555555")))

    story = []
    story.append(Paragraph("Roteiro de Apresentacao para a Banca", styles["DocTitle"]))
    story.append(Paragraph("Projeto Filosofia - Guia pratico de fala e demonstracao", styles["DocSub"]))
    story.append(Paragraph(f"Gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["DocSub"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("1) Objetivo deste roteiro", styles["DocH2"]))
    story.append(Paragraph("Este material ajuda voce a apresentar com seguranca em cerca de 10 minutos, explicando contexto, arquitetura, fluxo tecnico e demonstracao ao vivo.", styles["DocBody"]))

    story.append(Paragraph("2) Agenda sugerida (10 minutos)", styles["DocH2"]))
    agenda = [
        "Min 0-1: abertura pessoal e tema do projeto.",
        "Min 1-3: objetivo e funcionalidades principais.",
        "Min 3-5: arquitetura (front -> back -> banco).",
        "Min 5-7: demonstracao ao vivo.",
        "Min 7-9: regras de negocio e decisoes tecnicas.",
        "Min 9-10: fechamento e perguntas da banca.",
    ]
    story.append(ListFlowable([ListItem(Paragraph(item, styles["DocBody"])) for item in agenda], bulletType="bullet", start="•", leftIndent=14))

    story.append(Spacer(1, 10))
    story.append(Image(str(architecture_image), width=500, height=278))
    story.append(Paragraph("Figura 1 - Arquitetura por camadas da aplicacao.", styles["DocNote"]))

    story.append(Paragraph("3) Script de fala (pronto para usar/adaptar)", styles["DocH2"]))
    script_lines = [
        "<b>Abertura:</b> Este projeto individual une desenvolvimento web com autoconhecimento por meio da filosofia.",
        "<b>Funcionalidade:</b> O usuario cadastra, responde o questionario, visualiza resultado, registra reflexoes e acompanha metricas agregadas.",
        "<b>Arquitetura:</b> Front-end em HTML/CSS/JS, backend com Node/Express em camadas e banco MySQL.",
        "<b>Regra-chave:</b> Resultado final so conclui quando o usuario responde todas as perguntas ativas.",
        "<b>Fechamento:</b> O codigo foi mantido didatico, comentado e dentro do escopo academico.",
    ]
    for line in script_lines:
        story.append(Paragraph(line, styles["DocBody"]))
        story.append(Spacer(1, 4))

    story.append(Paragraph("4) Fluxo tecnico da Descoberta", styles["DocH2"]))
    story.append(Paragraph("Use a figura para explicar a sequencia de chamada da API ate o resultado.", styles["DocBody"]))
    story.append(Spacer(1, 6))
    story.append(Image(str(discovery_image), width=500, height=305))
    story.append(Paragraph("Figura 2 - Fluxo da funcionalidade de descoberta.", styles["DocNote"]))

    story.append(Paragraph("5) Roteiro de demonstracao ao vivo", styles["DocH2"]))
    demo_steps = [
        "Abrir index e contextualizar o tema.",
        "Realizar login.",
        "Responder uma pergunta na descoberta e mostrar progresso.",
        "Publicar uma reflexao no diario e mostrar historico.",
        "Abrir dashboard e explicar metricas reais.",
        "Abrir resultado e explicar soma de pesos por corrente.",
        "Encerrar sessao (Sair).",
    ]
    story.append(ListFlowable([ListItem(Paragraph(item, styles["DocBody"])) for item in demo_steps], bulletType="bullet", start="•", leftIndent=14))

    story.append(Paragraph("6) Perguntas provaveis da banca", styles["DocH2"]))
    qa_data = [
        ["Pergunta", "Resposta curta"],
        ["Como identifica usuario em rotas privadas?", "Pela sessao do servidor: req.session.usuario.id."],
        ["Como evita SQL Injection?", "Com queries parametrizadas usando placeholders (?) nos models."],
        ["Como impede resposta duplicada?", "Validacao no backend e restricao unica no banco."],
        ["Diferenca entre respostas e participantes?", "Respostas = total de registros. Participantes = usuarios distintos."],
        ["Como calcula resultado final?", "Soma de pesos por corrente filosofica nas perguntas ativas respondidas."],
    ]
    qa_table = Table(qa_data, colWidths=[210, 300])
    qa_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2a44")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), font_name),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("FONTNAME", (0, 1), (-1, -1), font_name),
                ("FONTSIZE", (0, 1), (-1, -1), 9.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#888888")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(qa_table)

    story.append(Paragraph("7) Contexto visual do tema", styles["DocH2"]))
    story.append(Paragraph("Imagens locais do projeto para apoiar a narrativa pessoal.", styles["DocBody"]))
    image_a = Image("public/assets/imgs/dantas.ink_09f891c089564312bba6ad85d8864f7b.jpg", width=240, height=170)
    image_b = Image("public/assets/imgs/dantas.ink_5483fc5c8a5f4376bc15b6234de3b8e7.jpg", width=240, height=170)
    image_table = Table([[image_a, image_b]], colWidths=[250, 250])
    image_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ALIGN", (0, 0), (-1, -1), "CENTER")]))
    story.append(Spacer(1, 6))
    story.append(image_table)
    story.append(Paragraph("Figura 3 - Imagens de apoio do tema do projeto.", styles["DocNote"]))

    story.append(Paragraph("8) Checklist antes da banca", styles["DocH2"]))
    checklist = [
        "Subir servidor e validar porta/ambiente.",
        "Conferir login com conta de teste.",
        "Garantir dados minimos para dashboard/resultado.",
        "Deixar abas abertas na ordem da demonstracao.",
        "Levar este PDF como apoio de fala.",
    ]
    story.append(ListFlowable([ListItem(Paragraph(item, styles["DocBody"])) for item in checklist], bulletType="bullet", start="•", leftIndent=14))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Boa apresentacao! Codigo organizado + fala estruturada = mais seguranca na banca.", styles["DocBody"]))

    doc = SimpleDocTemplate(str(pdf_path), pagesize=A4, leftMargin=36, rightMargin=36, topMargin=30, bottomMargin=30)
    doc.build(story)


def main():
    architecture_image = ASSETS_DIR / "arquitetura_camadas.png"
    discovery_image = ASSETS_DIR / "fluxo_descoberta.png"
    pdf_path = BASE_DIR / "roteiroBancaProjetoFilosofia.pdf"
    md_path = BASE_DIR / "roteiroBancaProjetoFilosofia.md"

    build_image_architecture(architecture_image)
    build_image_discovery_flow(discovery_image)
    build_pdf(pdf_path, architecture_image, discovery_image)

    md_path.write_text(
        "# Roteiro de Banca\n\n"
        "Arquivo principal: `docs/roteiroBancaProjetoFilosofia.pdf`\n\n"
        "Imagens geradas:\n"
        "- `docs/assets/arquitetura_camadas.png`\n"
        "- `docs/assets/fluxo_descoberta.png`\n",
        encoding="utf-8",
    )

    print(f"PDF gerado em: {pdf_path}")
    print(f"Markdown resumo em: {md_path}")
    print(f"Imagens em: {ASSETS_DIR}")


if __name__ == "__main__":
    main()
