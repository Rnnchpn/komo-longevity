# Ruban métrique Two-Step, 0 à 300 cm, sur 3 feuilles A4 paysage (4 bandes de 25 cm par feuille).
# Tracé vectoriel exact en millimètres : à imprimer en taille réelle (100 %).
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('Sans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SansB','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Cond','/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf'))
INK=(0.11,0.20,0.16); GOLD=(0.54,0.43,0.25); GREY=(0.55,0.55,0.52); TAB=(0.93,0.91,0.87)
W,H=landscape(A4)
LEN=250            # longueur graduée d'une bande (mm)
TABW=14            # languette de collage à gauche (mm)
SH=30              # hauteur d'une bande (mm)
X0=(W/mm-(LEN+TABW))/2+TABW   # début de la graduation (mm), centré sur la page
PER_PAGE=4; PAGES=3

def strip(c,y,start_cm,idx,total):
    """y = bord supérieur (bord de mesure) en mm."""
    x=X0
    # Languette de collage (sous la bande précédente) — sauf pour la toute première bande.
    if start_cm>0:
        c.setFillColorRGB(*TAB); c.rect((x-TABW)*mm,(y-SH)*mm,TABW*mm,SH*mm,stroke=0,fill=1)
        c.setFillColorRGB(*GREY); c.setFont('Sans',5.6)
        c.saveState(); c.translate((x-TABW/2)*mm,(y-SH/2)*mm); c.rotate(90)
        c.drawCentredString(0,1.2*mm,'coller sous la'); c.drawCentredString(0,-1.6*mm,'bande précédente'); c.restoreState()
    # Contour de découpe (pointillés) autour de la bande et de sa languette.
    c.setStrokeColorRGB(*GREY); c.setLineWidth(0.3); c.setDash(2,1.6)
    left=x-(TABW if start_cm>0 else 6)
    c.rect(left*mm,(y-SH)*mm,(x+LEN-left)*mm,SH*mm,stroke=1,fill=0); c.setDash()
    # Bord de mesure : trait continu sur toute la longueur.
    c.setStrokeColorRGB(*INK); c.setLineWidth(0.35); c.line(x*mm,y*mm,(x+LEN)*mm,y*mm)
    # Graduations : mm, 5 mm, cm, 5 cm, 10 cm.
    for t in range(0,LEN+1):
        cm=start_cm+t/10
        if t%100==0: L,w=12,0.55
        elif t%50==0: L,w=8.5,0.45
        elif t%10==0: L,w=6,0.35
        elif t%5==0: L,w=4,0.25
        else: L,w=2.4,0.18
        c.setLineWidth(w); c.line((x+t)*mm,y*mm,(x+t)*mm,(y-L)*mm)
        if t%10==0:
            v=int(round(cm)); c.setFillColorRGB(*INK)
            # Aux raccords, l'étiquette reste à l'intérieur de la bande (jamais sur la languette).
            draw=c.drawCentredString; dx=0
            if t==0: draw=c.drawString; dx=1.2
            if t==LEN: draw=c.drawRightString; dx=-1.2
            if v%10==0:
                c.setFont('SansB',10.5); draw((x+t+dx)*mm,(y-19)*mm,str(v))
            elif 0<t<LEN:
                c.setFont('Cond',5.6); draw((x+t)*mm,(y-12.2)*mm,str(v))
    # Début et fin de bande bien visibles (raccord).
    c.setLineWidth(0.9); c.setStrokeColorRGB(*INK)
    c.line(x*mm,y*mm,x*mm,(y-SH)*mm); c.line((x+LEN)*mm,y*mm,(x+LEN)*mm,(y-SH)*mm)
    if start_cm==0:
        c.setFillColorRGB(*GOLD); c.setFont('SansB',6.4)
        c.drawString((x+1.2)*mm,(y-24.5)*mm,'0 = LIGNE DE DÉPART')
    c.setFillColorRGB(*GREY); c.setFont('Sans',5.6)
    c.drawRightString((x+LEN-1.5)*mm,(y-SH+2)*mm,'Bande %d / %d · %d à %d cm · couper ici →'%(idx,total,start_cm,start_cm+25))
    c.drawString((x+1.5)*mm,(y-SH+2)*mm,'KŌMØ Motion · ruban Two-Step')

def calibration(c,y):
    x=X0+150
    c.setStrokeColorRGB(*INK); c.setLineWidth(0.35); c.line(x*mm,y*mm,(x+100)*mm,y*mm)
    for t in range(0,101):
        L=5 if t%10==0 else (3.2 if t%5==0 else 1.8)
        c.setLineWidth(0.5 if t in (0,100) else 0.2); c.line((x+t)*mm,y*mm,(x+t)*mm,(y+L)*mm)
    c.setFont('SansB',7.2); c.setFillColorRGB(*INK)
    c.drawString(X0*mm,(y+2.6)*mm,'Contrôle avant découpe')
    c.setFont('Sans',7); c.drawString(X0*mm,(y-1)*mm,'Ce segment doit mesurer exactement 10,0 cm à la règle.')
    c.drawString(X0*mm,(y-4.2)*mm,'Sinon : réimprimer en « Taille réelle / 100 % ».')

import sys
c=canvas.Canvas(sys.argv[1] if len(sys.argv)>1 else 'KOMO_Ruban_metrique_Two-Step_3_feuilles.pdf',pagesize=(W,H))
c.setTitle('KŌMØ Motion · Ruban métrique Two-Step 0–300 cm'); c.setAuthor('KŌMØ PULSE')
total=PER_PAGE*PAGES
for p in range(PAGES):
    top=H/mm-11
    c.setFillColorRGB(*INK); c.setFont('SansB',11.5)
    c.drawString((X0-TABW)*mm,top*mm,'Ruban métrique Two-Step · feuille %d / %d · %d à %d cm'%(p+1,PAGES,p*100,(p+1)*100))
    c.setFont('Sans',7.6); c.setFillColorRGB(0.3,0.32,0.3)
    lines=['Imprimer en taille réelle (100 %, sans « ajuster à la page »), vérifier le segment de 10 cm, découper sur les pointillés.',
           'Assembler dans l’ordre : couper chaque bande au trait de fin, la poser sur la languette grise de la suivante, bord contre le trait de début, coller.',
           'Scotcher le ruban au sol, le 0 sur la ligne de départ. On lit la distance à la pointe des pieds, sur le bord gradué.']
    for i,l in enumerate(lines): c.drawString((X0-TABW)*mm,(top-5-3.6*i)*mm,l)
    y=top-20
    for s in range(PER_PAGE):
        n=p*PER_PAGE+s
        strip(c,y,n*25,n+1,total); y-=SH+9.5
    calibration(c,13)
    c.showPage()
c.save()
print('ok',X0)
