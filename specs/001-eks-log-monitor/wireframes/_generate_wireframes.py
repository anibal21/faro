"""Faro wireframes — desktop only, env switcher, 2x2 log mosaic."""
from pathlib import Path

OUT = Path(__file__).resolve().parent
DX, DY = 40, 60
DW, DH = 1840, 720


def header(title: str) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c7ddf5"/>
      <stop offset="100%" stop-color="#b8d4f0"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <text x="960" y="28" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#4b5563" letter-spacing="1">{title}</text>
  <text x="40" y="52" fill="#8b5cf6" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">DESKTOP (16:9)</text>
"""


def callout(x: int, y: int, n: int) -> str:
    return (
        f'<g class="callout" transform="translate({x}, {y})">'
        f'<circle r="14" fill="#dc2626"/>'
        f'<text y="5" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">{n}</text>'
        f"</g>"
    )


def menubar(open_menu: str | None = None) -> str:
    s = f"""
    <rect x="0" y="0" width="{DW}" height="36" fill="#dcc8a8"/>
    <text x="16" y="24" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Faro</text>
    <text x="80" y="24" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">Ambiente</text>
    <text x="180" y="24" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">Ver</text>
    <text x="240" y="24" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Ayuda</text>
"""
    if open_menu == "ambiente":
        s += """
    <rect x="70" y="36" width="300" height="168" rx="4" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="86" y="60" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">Configurar nuevo ambiente…</text>
    <text x="86" y="90" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">Cargar ambiente configurado…</text>
    <text x="86" y="120" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">Cargar varios ambientes…</text>
    <line x1="80" y1="136" x2="350" y2="136" stroke="#b8a080"/>
    <text x="86" y="160" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Desconectar</text>
"""
    return s


def ann(items: list) -> str:
    parts = [
        '  <g id="annotations" transform="translate(40, 800)">',
        '    <rect width="1840" height="220" rx="8" fill="#dcc8a8" stroke="#b8a080"/>',
    ]
    positions = [(20, 20), (920, 20), (20, 120), (920, 120)]
    for i, (n, title, narrative, badges) in enumerate(items[:4]):
        x, y = positions[i]
        parts.append(f'    <g transform="translate({x}, {y})">')
        parts.append(f'      <circle cx="14" cy="14" r="14" fill="#dc2626"/>')
        parts.append(
            f'      <text x="14" y="19" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">{n}</text>'
        )
        parts.append(
            f'      <text x="40" y="14" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">{title}</text>'
        )
        parts.append(
            f'      <text x="40" y="34" font-family="system-ui, sans-serif" font-size="14" fill="#374151">{narrative}</text>'
        )
        bx = 40.0
        for btype, blabel in badges:
            color = {"US": "#0891b2", "FR": "#2563eb", "SC": "#ea580c"}[btype]
            w = 8 * len(blabel) + 24
            parts.append(f'      <rect x="{bx}" y="44" width="{w}" height="22" rx="4" fill="{color}"/>')
            parts.append(
                f'      <text x="{bx + w / 2}" y="59" fill="#fff" font-size="12" text-anchor="middle" font-family="system-ui, sans-serif">{blabel}</text>'
            )
            bx += w + 6
        parts.append("    </g>")
    parts.append("  </g>")
    return "\n".join(parts)


def footer(sig: str) -> str:
    return (
        f'  <text x="40" y="1060" fill="#374151" font-family="system-ui, sans-serif" '
        f'font-size="18" font-weight="bold">{sig}</text>\n</svg>\n'
    )


def ambiente_top_bar(
    value: str = "Seleccionar",
    open_dropdown: bool = False,
    callout_n: int | None = None,
) -> str:
    """Top toolbar matching 01/02: Ambiente label + right-aligned selector."""
    sel_w = 280
    sel_x = DW - 24 - sel_w
    label_x = sel_x - 16
    name_x = sel_x + sel_w - 36
    chev_x = sel_x + sel_w - 14
    y_bar = 36
    s = f"""
    <rect x="0" y="{y_bar}" width="{DW}" height="48" fill="#dcc8a8"/>
    <text x="{label_x}" y="{y_bar + 30}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Ambiente</text>
    <rect x="{sel_x}" y="{y_bar + 6}" width="{sel_w}" height="36" rx="6" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{name_x}" y="{y_bar + 30}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{value}</text>
    <text x="{chev_x}" y="{y_bar + 30}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">▾</text>
"""
    if callout_n is not None:
        s += callout(sel_x + sel_w // 2, y_bar + 24, callout_n)
    if open_dropdown:
        s += f"""
    <rect x="{sel_x}" y="{y_bar + 44}" width="{sel_w}" height="150" rx="6" fill="#f5f0e6" stroke="#b8a080"/>
    <rect x="{sel_x + 8}" y="{y_bar + 52}" width="{sel_w - 16}" height="36" rx="4" fill="#dcc8a8"/>
    <text x="{sel_x + sel_w - 16}" y="{y_bar + 76}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">prod-eks ●</text>
    <text x="{sel_x + sel_w - 16}" y="{y_bar + 112}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">staging-eks</text>
    <text x="{sel_x + sel_w - 16}" y="{y_bar + 144}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">qa-sandbox</text>
    <line x1="{sel_x + 16}" y1="{y_bar + 158}" x2="{sel_x + sel_w - 16}" y2="{y_bar + 158}" stroke="#b8a080"/>
    <text x="{sel_x + sel_w - 16}" y="{y_bar + 180}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#8b5cf6">Gestionar…</text>
"""
    return s


def empty_workspace_chrome(include_callouts: bool = True) -> str:
    """Shared empty desktop chrome used by 01 and 02 (modal overlays 02)."""
    cx = DW // 2
    callouts_cta = callout(cx + 180, 434, 2) if include_callouts else ""
    bar_callout = 1 if include_callouts else None
    return f"""
    <rect width="{DW}" height="{DH}" rx="8" fill="#e8d4b8" stroke="#b8a080"/>
{menubar()}
{ambiente_top_bar(value="Seleccionar", callout_n=bar_callout)}
    <rect x="{cx - 340}" y="200" width="680" height="320" rx="12" fill="#f5f0e6" stroke="#b8a080" stroke-dasharray="6 4"/>
    <text x="{cx}" y="280" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#1f2937">Bienvenido a Faro</text>
    <text x="{cx}" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">No hay ambientes cargados.</text>
    <text x="{cx}" y="348" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Usa el menú Ambiente o el selector a la derecha</text>
    <text x="{cx}" y="372" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">para configurar o cargar entornos.</text>
    <rect x="{cx - 160}" y="410" width="320" height="48" rx="6" fill="#8b5cf6"/>
    <text x="{cx}" y="440" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">Configurar nuevo ambiente</text>
{callouts_cta}
    <rect x="0" y="{DH - 60}" width="{DW}" height="60" fill="#dcc8a8"/>
    <text x="24" y="{DH - 24}" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Listo · Sin conexión</text>
"""


def write_01_splash() -> None:
    """Minimal splash window: brand + tagline + preparing (session purge)."""
    svg = header("FARO - SPLASH / PREPARANDO APLICACIÓN")
    # Prefer committed hand-tuned SVG; this stub regenerates a minimal placeholder if re-run.
    svg += """
  <text x="40" y="52" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">DESKTOP · VENTANA MÍNIMA</text>
  <g id="desktop" transform="translate(40, 60)">
    <rect width="1840" height="720" rx="8" fill="#0A1628" stroke="#334155"/>
    <rect x="520" y="80" width="800" height="520" rx="12" fill="#0F2744" stroke="#64748B" stroke-width="2"/>
    <text x="920" y="130" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="700" fill="#F8FAFC">Faro</text>
    <text x="920" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="700" fill="#F8FAFC">Faro</text>
    <text x="920" y="360" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#CBD5E1">Herramienta de monitoreo infraestructura para ambiente AWS</text>
    <text x="920" y="420" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" fill="#94A3B8">…preparando aplicación</text>
    <text x="920" y="470" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#64748B">Purga residuos de sesión/logs · conserva connection_instance</text>
  </g>
"""
    svg += ann(
        [
            (
                1,
                "Splash Faro",
                "Ventana mínima al abrir con marca Faro.",
                [("FR", "FR-023")],
            ),
            (
                2,
                "Tagline + preparing",
                "Texto AWS + …preparando mientras purge de sesión.",
                [("FR", "FR-023"), ("FR", "FR-024")],
            ),
        ]
    )
    svg += footer("001:01 | Faro Splash Preparing | SpecKit")
    # Keep hand-authored 01-splash-preparing.svg as source of truth; do not overwrite if present.
    target = OUT / "01-splash-preparing.svg"
    if not target.exists():
        target.write_text(svg, encoding="utf-8")


def write_02() -> None:
    svg = header("FARO - EMPTY WORKSPACE (NO ENVIRONMENTS)")
    svg += f"""
  <g id="desktop" transform="translate({DX}, {DY})">
{empty_workspace_chrome(include_callouts=True)}
  </g>
"""
    svg += ann(
        [
            (
                1,
                "US-001 Ambiente selector",
                "Etiqueta Ambiente + control con placeholder Seleccionar (alineado a la derecha).",
                [("US", "US-001"), ("FR", "FR-001"), ("SC", "SC-001")],
            ),
            (
                2,
                "US-001 Empty CTA",
                "Menú cerrado + CTA para configurar el primer ambiente.",
                [("US", "US-001"), ("FR", "FR-001")],
            ),
        ]
    )
    svg += footer("001:02 | Faro Empty Workspace | SpecKit")
    (OUT / "02-empty-workspace.svg").write_text(svg, encoding="utf-8")


def write_03() -> None:
    """Empty base + professional modal: Configuración nuevo ambiente."""
    svg = header("FARO - NEW ENVIRONMENT CONFIG MODAL")
    # Taller modal: SSH + PEM + IAM path + region + cluster
    mw, mh = 680, 700
    mx = (DW - mw) // 2
    my = 12
    pad = 24
    label_w = 168
    ctrl_x = mx + pad + label_w
    ctrl_w = mw - pad * 2 - label_w
    row_h = 46
    fields = [
        ("Nombre de la conexión", "prod-eks", False),
        ("Host (bastión)", "bastion.ejemplo.corp", False),
        ("Puerto SSH", "22", False),
        ("Username SSH", "ec2-user", False),
        ("Namespace", "default", False),
        ("PEM (Private Key)", "C:\\Users\\…\\faro.pem", True),
        ("Credenciales IAM", "C:\\Users\\…\\aws-creds.ini", True),
        ("region_name", "us-east-1", False),
        ("cluster_name", "prod-eks-cluster", False),
    ]
    svg += f"""
  <g id="desktop" transform="translate({DX}, {DY})">
{empty_workspace_chrome(include_callouts=False)}
    <rect x="0" y="0" width="{DW}" height="{DH}" fill="#1f2937" opacity="0.5"/>
    <!-- modal card -->
    <rect x="{mx}" y="{my}" width="{mw}" height="{mh}" rx="8" fill="#f5f0e6" stroke="#b8a080"/>
    <!-- header -->
    <rect x="{mx}" y="{my}" width="{mw}" height="48" rx="8" fill="#e8d4b8"/>
    <rect x="{mx}" y="{my + 32}" width="{mw}" height="16" fill="#e8d4b8"/>
    <line x1="{mx}" y1="{my + 48}" x2="{mx + mw}" y2="{my + 48}" stroke="#b8a080"/>
    <text x="{mx + pad}" y="{my + 32}" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#1f2937">Configuración nuevo ambiente</text>
    <text x="{mx + mw - pad}" y="{my + 32}" text-anchor="end" font-family="system-ui, sans-serif" font-size="16" fill="#4b5563">×</text>
{callout(mx + mw - 8, my + 24, 1)}
    <!-- body intro -->
    <text x="{mx + pad}" y="{my + 72}" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">PEM + SSH + ruta IAM + region_name + cluster_name. Solo se guardan rutas e identificadores, no secretos.</text>
"""
    y0 = my + 88
    for i, (lab, placeholder, has_browse) in enumerate(fields):
        y = y0 + i * row_h
        svg += f"""
    <text x="{mx + pad}" y="{y + 26}" font-family="system-ui, sans-serif" font-size="13" fill="#4b5563">{lab}</text>
    <rect x="{ctrl_x}" y="{y + 4}" width="{ctrl_w}" height="36" rx="4" fill="#e8d4b8" stroke="#b8a080"/>
"""
        if has_browse:
            browse_w = 100
            svg += f"""
    <text x="{ctrl_x + 10}" y="{y + 28}" font-family="system-ui, sans-serif" font-size="13" fill="#6b7280">{placeholder}</text>
    <rect x="{ctrl_x + ctrl_w - browse_w - 6}" y="{y + 8}" width="{browse_w}" height="28" rx="4" fill="#dcc8a8" stroke="#b8a080"/>
    <text x="{ctrl_x + ctrl_w - browse_w / 2 - 6}" y="{y + 28}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#1f2937">Examinar…</text>
"""
        else:
            svg += f"""
    <text x="{ctrl_x + 10}" y="{y + 28}" font-family="system-ui, sans-serif" font-size="13" fill="#6b7280">{placeholder}</text>
"""
        if i == 0:
            svg += callout(ctrl_x + ctrl_w - 8, y + 22, 2)
        if i == 6:
            svg += callout(ctrl_x + ctrl_w - 8, y + 22, 3)

    # footer actions
    footer_y = my + mh - 64
    svg += f"""
    <line x1="{mx}" y1="{footer_y - 10}" x2="{mx + mw}" y2="{footer_y - 10}" stroke="#b8a080"/>
    <rect x="{mx}" y="{footer_y - 10}" width="{mw}" height="{mh - (footer_y - my) + 10}" rx="8" fill="#e8d4b8"/>
    <rect x="{mx}" y="{footer_y - 10}" width="{mw}" height="18" fill="#e8d4b8"/>
    <rect x="{mx + pad}" y="{footer_y}" width="200" height="40" rx="4" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{mx + pad + 100}" y="{footer_y + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#1f2937">Probar Túnel SSH</text>
{callout(mx + pad + 210, footer_y + 20, 4)}
    <rect x="{mx + mw - pad - 200}" y="{footer_y}" width="200" height="40" rx="4" fill="#8b5cf6"/>
    <text x="{mx + mw - pad - 100}" y="{footer_y + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ffffff">Agregar Conexión</text>
  </g>
"""
    svg += ann(
        [
            (
                1,
                "US-001 Config modal",
                "Formulario completo de nuevo ambiente sobre empty workspace.",
                [("US", "US-001"), ("FR", "FR-001"), ("FR", "FR-002")],
            ),
            (
                2,
                "US-001 Connection name",
                "Nombre de la conexión identifica el ambiente en el selector.",
                [("US", "US-001"), ("FR", "FR-001"), ("FR", "FR-002")],
            ),
            (
                3,
                "US-001 PEM + IAM paths",
                "SSH + PEM + ruta IAM + region_name + cluster_name (sin secretos en BD).",
                [("US", "US-001"), ("FR", "FR-002"), ("FR", "FR-003"), ("SC", "SC-008")],
            ),
            (
                4,
                "US-001 Actions",
                "Probar Túnel SSH valida; Agregar Conexión guarda rutas e identificadores.",
                [("US", "US-001"), ("FR", "FR-004"), ("SC", "SC-001")],
            ),
        ]
    )
    svg += footer("001:03 | Faro New Environment Modal | SpecKit")
    (OUT / "03-new-environment-modal.svg").write_text(svg, encoding="utf-8")


def write_04() -> None:
    """Connected workspace: compact nav + tabbed log views (payments Structured)."""
    svg = header("FARO - ENVIRONMENT LOADED (TABS + STRUCTURED)")
    rail_w = 220
    content_top = 84
    rail_h = DH - content_top - 60
    main_x = rail_w
    main_w = DW - rail_w
    pad = 6

    # name, replicas, open_in_tab (not "selected" — open as tab)
    pods = [
        ("payments-api", "3/3", True),
        ("orders-service", "2/2", False),
        ("auth-gateway", "3/3", True),
        ("inventory-worker", "1/2", False),
        ("billing-worker", "0/1", True),
    ]
    cms = [
        ("app-config", None),
        ("payments-secrets-ref", None),
        ("feature-flags", None),
    ]
    open_count = sum(1 for *_, o in pods if o)

    svg += f"""
  <g id="desktop" transform="translate({DX}, {DY})">
    <rect width="{DW}" height="{DH}" rx="8" fill="#e8d4b8" stroke="#b8a080"/>
{menubar()}
{ambiente_top_bar(value="prod-eks", open_dropdown=False, callout_n=1)}
    <rect x="0" y="{content_top}" width="{rail_w}" height="{rail_h}" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{pad + 4}" y="{content_top + 22}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Deployments</text>
    <rect x="{pad}" y="{content_top + 32}" width="{rail_w - pad * 2}" height="28" fill="#dcc8a8"/>
    <text x="{pad + 8}" y="{content_top + 52}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">▾ Pods</text>
    <text x="{rail_w - pad - 8}" y="{content_top + 52}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{len(pods)}</text>
"""
    y = content_top + 64
    for i, (name, replicas, is_open) in enumerate(pods):
        row_h = 32
        bg = "#e8d4b8" if i % 2 == 0 else "#f5f0e6"
        # Open-in-tab marker (not selection fill) — small glyph left of name
        mark = "◇" if is_open else " "
        svg += f"""
    <rect x="{pad}" y="{y}" width="{rail_w - pad * 2}" height="{row_h}" fill="{bg}"/>
    <text x="{pad + 8}" y="{y + 22}" font-family="system-ui, sans-serif" font-size="14" fill="#8b5cf6">{mark}</text>
    <text x="{pad + 24}" y="{y + 22}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{name}</text>
    <text x="{rail_w - pad - 8}" y="{y + 22}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{replicas}</text>
"""
        y += row_h

    y += 4
    cm_y = y
    svg += f"""
    <rect x="{pad}" y="{y}" width="{rail_w - pad * 2}" height="28" fill="#dcc8a8"/>
    <text x="{pad + 8}" y="{y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">▸ ConfigMaps</text>
    <text x="{rail_w - pad - 8}" y="{y + 20}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{len(cms)}</text>
"""

    # --- Main: tab strip + Structured view for payments ---
    tab_h = 36
    tabs = [
        ("payments-api", True),
        ("auth-gateway", False),
        ("billing-worker", False),
    ]
    tab_w = 190
    tip_x = rail_w + 20

    svg += f"""
    <rect x="{main_x}" y="{content_top}" width="{main_w}" height="{rail_h}" fill="#e8d4b8"/>
    <!-- tab bar -->
    <rect x="{main_x}" y="{content_top}" width="{main_w}" height="{tab_h}" fill="#dcc8a8"/>
"""
    for i, (tname, active) in enumerate(tabs):
        tx = main_x + 8 + i * (tab_w + 6)
        fill = "#f5f0e6" if active else "#e8d4b8"
        stroke = "#8b5cf6" if active else "#b8a080"
        sw = 2 if active else 1
        svg += f"""
    <rect x="{tx}" y="{content_top + 4}" width="{tab_w}" height="{tab_h - 6}" rx="4" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>
    <rect x="{tx + 8}" y="{content_top + 10}" width="18" height="18" rx="3" fill="#8b5cf6"/>
    <text x="{tx + 17}" y="{content_top + 24}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">P</text>
    <text x="{tx + 32}" y="{content_top + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{tname}</text>
    <text x="{tx + tab_w - 14}" y="{content_top + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">×</text>
"""
    svg += callout(main_x + 8 + tab_w - 8, content_top + 18, 4)

    # toolbar under tabs: Structured | Raw
    tool_y = content_top + tab_h
    svg += f"""
    <rect x="{main_x}" y="{tool_y}" width="{main_w}" height="40" fill="#e8d4b8"/>
    <rect x="{main_x + 12}" y="{tool_y + 6}" width="120" height="28" rx="4" fill="#8b5cf6"/>
    <text x="{main_x + 72}" y="{tool_y + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Structured</text>
    <rect x="{main_x + 140}" y="{tool_y + 6}" width="90" height="28" rx="4" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{main_x + 185}" y="{tool_y + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">Raw</text>
    <rect x="{main_x + 250}" y="{tool_y + 6}" width="280" height="28" rx="4" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{main_x + 262}" y="{tool_y + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#9ca3af">Buscar en buffer…</text>
"""

    # Structured log table
    body_y = tool_y + 40
    body_h = content_top + rail_h - body_y
    col_w = main_w - 24
    svg += f"""
    <rect x="{main_x + 12}" y="{body_y}" width="{col_w}" height="{body_h - 8}" fill="#f5f0e6" stroke="#b8a080"/>
    <rect x="{main_x + 12}" y="{body_y}" width="{col_w}" height="28" fill="#dcc8a8"/>
    <text x="{main_x + 24}" y="{body_y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Severidad</text>
    <text x="{main_x + 140}" y="{body_y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Detalle (escritura)</text>
    <text x="{main_x + col_w - 100}" y="{body_y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Pod</text>
"""
    rows = [
        ("ERROR", "NullPointerException … at PaymentService.charge", "payments-api-7f9", True),
        ("INFO", "Started Application in 12.4 seconds", "payments-api-7f9", False),
        ("WARN", "Slow query 1200ms on orders", "payments-api-2ab", False),
        ("ERROR", "java.lang.OutOfMemoryError: Java heap space", "payments-api-2ab", True),
        ("INFO", "Health check OK", "payments-api-7f9", False),
        ("WARN", "Circuit breaker half-open", "payments-api-7f9", False),
        ("INFO", "Received POST /api/pay", "payments-api-7f9", False),
    ]
    for i, (sev, det, pod, is_err) in enumerate(rows):
        ry = body_y + 28 + i * 40
        if ry + 36 > body_y + body_h - 8:
            break
        bg = "#fecaca" if is_err else "#f5f0e6"
        svg += f"""
    <rect x="{main_x + 12}" y="{ry}" width="{col_w}" height="40" fill="{bg}" stroke="#b8a080"/>
    <text x="{main_x + 24}" y="{ry + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{sev}</text>
    <text x="{main_x + 140}" y="{ry + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">{det[:56]}</text>
    <text x="{main_x + col_w - 100}" y="{ry + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{pod}</text>
"""

    # Callouts last (above UI)
    svg += f"""
{callout(tip_x, content_top + 16, 2)}
{callout(tip_x, content_top + 46, 3)}
    <rect x="0" y="{DH - 60}" width="{DW}" height="60" fill="#dcc8a8"/>
    <text x="24" y="{DH - 24}" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Conectado · prod-eks · pestaña activa: payments-api (Structured) · vistas {open_count}/4</text>
  </g>
"""
    svg += ann(
        [
            (
                1,
                "US-001 Env switcher",
                "Selector Ambiente a la derecha (mismo patrón que 01/02).",
                [("US", "US-001"), ("FR", "FR-004")],
            ),
            (
                2,
                "US-002 Deployments nav",
                "Rail compacto; ◇ marca artefactos abiertos en pestaña (no selección).",
                [("US", "US-002"), ("FR", "FR-005"), ("FR", "FR-006")],
            ),
            (
                3,
                "US-002 Pods accordion",
                "Acordeón Pods con artefactos y réplicas.",
                [("US", "US-002"), ("FR", "FR-006"), ("SC", "SC-002")],
            ),
            (
                4,
                "US-003 Tabs + Structured",
                "Pestañas payments/auth/billing con ×; activa payments en Structured.",
                [("US", "US-003"), ("FR", "FR-009"), ("FR", "FR-022"), ("SC", "SC-009")],
            ),
        ]
    )
    svg += footer("001:04 | Faro Environment Loaded | SpecKit")
    (OUT / "04-environment-loaded.svg").write_text(svg, encoding="utf-8")


def write_05() -> None:
    """ConfigMaps accordion open + tabs with Raw-only view."""
    svg = header("FARO - CONFIGMAPS TABS (RAW ONLY)")
    rail_w = 220
    content_top = 84
    rail_h = DH - content_top - 60
    main_x = rail_w
    main_w = DW - rail_w
    pad = 6

    pods = [
        ("payments-api", "3/3"),
        ("orders-service", "2/2"),
        ("auth-gateway", "3/3"),
        ("inventory-worker", "1/2"),
        ("billing-worker", "0/1"),
    ]
    # Same artifact set as before; first three open as tabs
    cms = [
        ("app-config", True),
        ("payments-secrets-ref", True),
        ("feature-flags", True),
    ]
    open_count = sum(1 for _, o in cms if o)
    tip_x = rail_w + 20

    svg += f"""
  <g id="desktop" transform="translate({DX}, {DY})">
    <rect width="{DW}" height="{DH}" rx="8" fill="#e8d4b8" stroke="#b8a080"/>
{menubar()}
{ambiente_top_bar(value="prod-eks", open_dropdown=False, callout_n=1)}
    <rect x="0" y="{content_top}" width="{rail_w}" height="{rail_h}" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{pad + 4}" y="{content_top + 22}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Deployments</text>
    <!-- Pods collapsed -->
    <rect x="{pad}" y="{content_top + 32}" width="{rail_w - pad * 2}" height="28" fill="#dcc8a8"/>
    <text x="{pad + 8}" y="{content_top + 52}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">▸ Pods</text>
    <text x="{rail_w - pad - 8}" y="{content_top + 52}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{len(pods)}</text>
{callout(tip_x, content_top + 46, 2)}
"""
    # ConfigMaps open
    y = content_top + 64
    svg += f"""
    <rect x="{pad}" y="{y}" width="{rail_w - pad * 2}" height="28" fill="#dcc8a8"/>
    <text x="{pad + 8}" y="{y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">▾ ConfigMaps</text>
    <text x="{rail_w - pad - 8}" y="{y + 20}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{len(cms)}</text>
{callout(tip_x, y + 14, 3)}
"""
    y += 28
    for i, (name, is_open) in enumerate(cms):
        row_h = 32
        bg = "#e8d4b8" if i % 2 == 0 else "#f5f0e6"
        mark = "◇" if is_open else " "
        svg += f"""
    <rect x="{pad}" y="{y}" width="{rail_w - pad * 2}" height="{row_h}" fill="{bg}"/>
    <text x="{pad + 8}" y="{y + 22}" font-family="system-ui, sans-serif" font-size="14" fill="#8b5cf6">{mark}</text>
    <text x="{pad + 24}" y="{y + 22}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{name}</text>
"""
        y += row_h

    tab_h = 36
    tabs = [
        ("app-config", True),
        ("payments-secrets-ref", False),
        ("feature-flags", False),
    ]
    tab_w = 210

    svg += f"""
    <rect x="{main_x}" y="{content_top}" width="{main_w}" height="{rail_h}" fill="#e8d4b8"/>
    <rect x="{main_x}" y="{content_top}" width="{main_w}" height="{tab_h}" fill="#dcc8a8"/>
"""
    for i, (tname, active) in enumerate(tabs):
        tx = main_x + 8 + i * (tab_w + 6)
        fill = "#f5f0e6" if active else "#e8d4b8"
        stroke = "#8b5cf6" if active else "#b8a080"
        sw = 2 if active else 1
        # shorten label if needed for display
        label = tname if len(tname) <= 22 else tname[:20] + "…"
        svg += f"""
    <rect x="{tx}" y="{content_top + 4}" width="{tab_w}" height="{tab_h - 6}" rx="4" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>
    <rect x="{tx + 6}" y="{content_top + 10}" width="28" height="18" rx="3" fill="#8b5cf6"/>
    <text x="{tx + 20}" y="{content_top + 24}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">CM</text>
    <text x="{tx + 40}" y="{content_top + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{label}</text>
    <text x="{tx + tab_w - 14}" y="{content_top + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">×</text>
"""
    svg += callout(main_x + 8 + tab_w - 8, content_top + 18, 4)

    # Raw-only chrome (no Structured)
    tool_y = content_top + tab_h
    svg += f"""
    <rect x="{main_x}" y="{tool_y}" width="{main_w}" height="40" fill="#e8d4b8"/>
    <rect x="{main_x + 12}" y="{tool_y + 6}" width="90" height="28" rx="4" fill="#8b5cf6"/>
    <text x="{main_x + 57}" y="{tool_y + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Raw</text>
"""

    body_y = tool_y + 40
    body_h = content_top + rail_h - body_y
    col_w = main_w - 24
    raw_lines = [
        "apiVersion: v1",
        "kind: ConfigMap",
        "metadata:",
        "  name: app-config",
        "  namespace: default",
        "data:",
        "  application.yml: |",
        "    spring:",
        "      datasource:",
        "        url: jdbc:postgresql://…",
        "  logging.level.root: INFO",
        "  feature.newCheckout: \"true\"",
        "█",
    ]
    svg += f"""
    <rect x="{main_x + 12}" y="{body_y}" width="{col_w}" height="{body_h - 8}" fill="#1f2937"/>
"""
    for i, line in enumerate(raw_lines):
        ly = body_y + 28 + i * 28
        if ly > body_y + body_h - 24:
            break
        safe = line.replace("&", "&amp;").replace("<", "&lt;")
        svg += f'<text x="{main_x + 28}" y="{ly}" font-family="ui-monospace, monospace" font-size="14" fill="#e2e8f0">{safe}</text>'

    svg += f"""
    <rect x="0" y="{DH - 60}" width="{DW}" height="60" fill="#dcc8a8"/>
    <text x="24" y="{DH - 24}" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Conectado · prod-eks · pestaña activa: app-config (Raw) · vistas {open_count}/4</text>
  </g>
"""
    svg += ann(
        [
            (
                1,
                "US-001 Env switcher",
                "Mismo selector Ambiente a la derecha.",
                [("US", "US-001"), ("FR", "FR-004")],
            ),
            (
                2,
                "US-002 Pods collapsed",
                "Acordeón Pods cerrado; foco en ConfigMaps.",
                [("US", "US-002"), ("FR", "FR-005")],
            ),
            (
                3,
                "US-002 ConfigMaps open",
                "Acordeón ConfigMaps abierto con artefactos; ◇ = abierto en pestaña.",
                [("US", "US-002"), ("FR", "FR-011")],
            ),
            (
                4,
                "US-002 ConfigMap tabs Raw",
                "Pestañas de ConfigMaps con ×; solo Raw (sin Structured).",
                [("US", "US-002"), ("FR", "FR-011"), ("FR", "FR-018")],
            ),
        ]
    )
    svg += footer("001:05 | Faro ConfigMaps Raw Tabs | SpecKit")
    (OUT / "05-configmaps-raw-tabs.svg").write_text(svg, encoding="utf-8")


def write_06() -> None:
    """Like 04, after click on Structured error row → right detail panel (3 puntos)."""
    svg = header("FARO - STRUCTURED LOG DETAIL (CLICK FINDING)")
    rail_w = 220
    content_top = 84
    rail_h = DH - content_top - 60
    main_x = rail_w
    main_w = DW - rail_w
    pad = 6
    tip_x = rail_w + 20

    pods = [
        ("payments-api", "3/3", True),
        ("orders-service", "2/2", False),
        ("auth-gateway", "3/3", True),
        ("inventory-worker", "1/2", False),
        ("billing-worker", "0/1", True),
    ]
    open_count = sum(1 for *_, o in pods if o)

    svg += f"""
  <g id="desktop" transform="translate({DX}, {DY})">
    <rect width="{DW}" height="{DH}" rx="8" fill="#e8d4b8" stroke="#b8a080"/>
{menubar()}
{ambiente_top_bar(value="prod-eks", open_dropdown=False, callout_n=1)}
    <rect x="0" y="{content_top}" width="{rail_w}" height="{rail_h}" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{pad + 4}" y="{content_top + 22}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Deployments</text>
    <rect x="{pad}" y="{content_top + 32}" width="{rail_w - pad * 2}" height="28" fill="#dcc8a8"/>
    <text x="{pad + 8}" y="{content_top + 52}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">▾ Pods</text>
    <text x="{rail_w - pad - 8}" y="{content_top + 52}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{len(pods)}</text>
"""
    y = content_top + 64
    for i, (name, replicas, is_open) in enumerate(pods):
        row_h = 32
        bg = "#e8d4b8" if i % 2 == 0 else "#f5f0e6"
        mark = "◇" if is_open else " "
        svg += f"""
    <rect x="{pad}" y="{y}" width="{rail_w - pad * 2}" height="{row_h}" fill="{bg}"/>
    <text x="{pad + 8}" y="{y + 22}" font-family="system-ui, sans-serif" font-size="14" fill="#8b5cf6">{mark}</text>
    <text x="{pad + 24}" y="{y + 22}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{name}</text>
    <text x="{rail_w - pad - 8}" y="{y + 22}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{replicas}</text>
"""
        y += row_h
    y += 4
    svg += f"""
    <rect x="{pad}" y="{y}" width="{rail_w - pad * 2}" height="28" fill="#dcc8a8"/>
    <text x="{pad + 8}" y="{y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">▸ ConfigMaps</text>
    <text x="{rail_w - pad - 8}" y="{y + 20}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">3</text>
"""

    tab_h = 36
    tabs = [("payments-api", True), ("auth-gateway", False), ("billing-worker", False)]
    tab_w = 190
    svg += f"""
    <rect x="{main_x}" y="{content_top}" width="{main_w}" height="{rail_h}" fill="#e8d4b8"/>
    <rect x="{main_x}" y="{content_top}" width="{main_w}" height="{tab_h}" fill="#dcc8a8"/>
"""
    for i, (tname, active) in enumerate(tabs):
        tx = main_x + 8 + i * (tab_w + 6)
        fill = "#f5f0e6" if active else "#e8d4b8"
        stroke = "#8b5cf6" if active else "#b8a080"
        sw = 2 if active else 1
        svg += f"""
    <rect x="{tx}" y="{content_top + 4}" width="{tab_w}" height="{tab_h - 6}" rx="4" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>
    <rect x="{tx + 8}" y="{content_top + 10}" width="18" height="18" rx="3" fill="#8b5cf6"/>
    <text x="{tx + 17}" y="{content_top + 24}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">P</text>
    <text x="{tx + 32}" y="{content_top + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{tname}</text>
    <text x="{tx + tab_w - 14}" y="{content_top + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">×</text>
"""

    tool_y = content_top + tab_h
    svg += f"""
    <rect x="{main_x}" y="{tool_y}" width="{main_w}" height="40" fill="#e8d4b8"/>
    <rect x="{main_x + 12}" y="{tool_y + 6}" width="120" height="28" rx="4" fill="#8b5cf6"/>
    <text x="{main_x + 72}" y="{tool_y + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Structured</text>
    <rect x="{main_x + 140}" y="{tool_y + 6}" width="90" height="28" rx="4" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{main_x + 185}" y="{tool_y + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">Raw</text>
    <rect x="{main_x + 250}" y="{tool_y + 6}" width="280" height="28" rx="4" fill="#f5f0e6" stroke="#b8a080"/>
    <text x="{main_x + 262}" y="{tool_y + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#9ca3af">Buscar en buffer…</text>
"""

    # Split: logs left + detail panel right (inside tab)
    body_y = tool_y + 40
    body_h = content_top + rail_h - body_y - 8
    gap = 10
    panel_w = 380
    logs_w = main_w - 24 - gap - panel_w
    logs_x = main_x + 12
    panel_x = logs_x + logs_w + gap

    svg += f"""
    <rect x="{logs_x}" y="{body_y}" width="{logs_w}" height="{body_h}" fill="#f5f0e6" stroke="#b8a080"/>
    <rect x="{logs_x}" y="{body_y}" width="{logs_w}" height="28" fill="#dcc8a8"/>
    <text x="{logs_x + 12}" y="{body_y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Severidad</text>
    <text x="{logs_x + 110}" y="{body_y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Detalle</text>
    <text x="{logs_x + logs_w - 90}" y="{body_y + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Pod</text>
"""
    rows = [
        ("ERROR", "NullPointerException … at PaymentService.charge", "payments-api-7f9", True, True),
        ("INFO", "Started Application in 12.4 seconds", "payments-api-7f9", False, False),
        ("WARN", "Slow query 1200ms on orders", "payments-api-2ab", False, False),
        ("ERROR", "java.lang.OutOfMemoryError: Java heap space", "payments-api-2ab", True, False),
        ("INFO", "Health check OK", "payments-api-7f9", False, False),
        ("WARN", "Circuit breaker half-open", "payments-api-7f9", False, False),
    ]
    clicked_y = None
    for i, (sev, det, pod, is_err, clicked) in enumerate(rows):
        ry = body_y + 28 + i * 40
        if ry + 36 > body_y + body_h:
            break
        if clicked:
            clicked_y = ry + 20
            bg = "#fecaca"
            stroke, sw = "#8b5cf6", 3
        else:
            bg = "#fecaca" if is_err else "#f5f0e6"
            stroke, sw = "#b8a080", 1
        svg += f"""
    <rect x="{logs_x}" y="{ry}" width="{logs_w}" height="40" fill="{bg}" stroke="{stroke}" stroke-width="{sw}"/>
    <text x="{logs_x + 12}" y="{ry + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#1f2937">{sev}</text>
    <text x="{logs_x + 110}" y="{ry + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">{det[:42]}</text>
    <text x="{logs_x + logs_w - 90}" y="{ry + 26}" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">{pod}</text>
"""
    if clicked_y is not None:
        svg += callout(logs_x + logs_w - 20, clicked_y, 2)

    # Right detail panel — 3 puntos acordados
    svg += f"""
    <rect x="{panel_x}" y="{body_y}" width="{panel_w}" height="{body_h}" fill="#f5f0e6" stroke="#8b5cf6" stroke-width="2"/>
    <rect x="{panel_x}" y="{body_y}" width="{panel_w}" height="40" fill="#dcc8a8"/>
    <text x="{panel_x + 16}" y="{body_y + 26}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">Hallazgo (reglas Spring Boot)</text>
    <text x="{panel_x + panel_w - 16}" y="{body_y + 26}" text-anchor="end" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">×</text>
{callout(panel_x + panel_w - 8, body_y + 20, 3)}
    <rect x="{panel_x + 16}" y="{body_y + 56}" width="72" height="24" rx="4" fill="#dc2626"/>
    <text x="{panel_x + 52}" y="{body_y + 74}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">ERROR</text>
    <text x="{panel_x + 100}" y="{body_y + 74}" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">NullPointerException</text>

    <text x="{panel_x + 16}" y="{body_y + 120}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">1. Qué pasó</text>
    <text x="{panel_x + 16}" y="{body_y + 144}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">El servicio falló al cobrar: una referencia</text>
    <text x="{panel_x + 16}" y="{body_y + 164}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">esperada era nula en PaymentService.charge.</text>
{callout(panel_x + panel_w - 20, body_y + 140, 4)}

    <text x="{panel_x + 16}" y="{body_y + 210}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">2. Qué significa</text>
    <text x="{panel_x + 16}" y="{body_y + 234}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">Falta un dato obligatorio en el flujo de pago;</text>
    <text x="{panel_x + 16}" y="{body_y + 254}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">el código asumió que el objeto ya existía.</text>

    <text x="{panel_x + 16}" y="{body_y + 300}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#1f2937">3. Qué hacer</text>
    <text x="{panel_x + 16}" y="{body_y + 324}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">Revisar el objeto Payment antes de charge();</text>
    <text x="{panel_x + 16}" y="{body_y + 344}" font-family="system-ui, sans-serif" font-size="14" fill="#374151">avisar al equipo de backend con este stacktrace.</text>

    <rect x="0" y="{DH - 60}" width="{DW}" height="60" fill="#dcc8a8"/>
    <text x="24" y="{DH - 24}" font-family="system-ui, sans-serif" font-size="14" fill="#4b5563">Conectado · prod-eks · payments-api · hallazgo abierto (click Structured)</text>
  </g>
"""
    svg += ann(
        [
            (
                1,
                "US-001 Env switcher",
                "Misma barra Ambiente que en 03.",
                [("US", "US-001"), ("FR", "FR-004")],
            ),
            (
                2,
                "US-004 Click write-group",
                "Click en escritura ERROR marcada; fila activa con borde.",
                [("US", "US-004"), ("FR", "FR-020"), ("SC", "SC-009")],
            ),
            (
                3,
                "US-004 Detail panel",
                "Panel derecho dentro de la pestaña con el hallazgo de reglas.",
                [("US", "US-004"), ("FR", "FR-012"), ("FR", "FR-013")],
            ),
            (
                4,
                "US-004 Tres puntos",
                "Qué pasó · Qué significa · Qué hacer (lenguaje simple).",
                [("US", "US-004"), ("FR", "FR-013"), ("SC", "SC-005")],
            ),
        ]
    )
    svg += footer("001:06 | Faro Structured Finding Detail | SpecKit")
    (OUT / "06-structured-finding-detail.svg").write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    write_01_splash()
    write_02()
    write_03()
    write_04()
    write_05()
    write_06()
    print("OK:", sorted(x.name for x in OUT.glob("0*.svg")))
