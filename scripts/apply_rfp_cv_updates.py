#!/usr/bin/env python3
"""Apply RFP-oriented content updates to public/data/cv.json (layout-safe)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CV_PATH = ROOT / "public" / "data" / "cv.json"

ABOUT_PT = (
    "Software Architect e Platform Engineer (.NET, Python e sistemas) com trajetória em "
    "modernização e integração em ambientes de grande porte (UBS, Gol, Decolar, CVC, Momentum). "
    "Foco recente em reliability (timeouts, concorrência, CI), revisão de mudanças multi-arquivo "
    "e entrega evidence-based.\n\n"
    "Criador do control plane multi-cloud PolyStack e do produto sibling LifeGraph — governação "
    "com claims, provas e cannot-do explícitos. Especialista em .NET Aspire, composição multi-cloud "
    "(AWS/Azure/local), frontends React estáticos, OIDC/SSO, OpenTelemetry e automação com dry-run; "
    "ApplyCloud cutover irrestrito permanece bloqueado por desenho."
)

ABOUT_EN = (
    "Software Architect and Platform Engineer (.NET, Python, and systems) with a track record "
    "modernizing and integrating large-scale environments (UBS, Gol, Decolar, CVC, Momentum). "
    "Recent focus on reliability (timeouts, concurrency, CI), multi-file change review, and "
    "evidence-based delivery.\n\n"
    "Creator of the PolyStack multi-cloud control plane and the LifeGraph sibling product — "
    "governance with explicit claims, proofs, and cannot-do. Specialist in .NET Aspire, multi-cloud "
    "composition (AWS/Azure/local), static React frontends, OIDC/SSO, OpenTelemetry, and dry-run "
    "automation; unrestricted ApplyCloud cutover remains blocked by design."
)

OPEN_WORK = {
    "id": "ach-open-work",
    "title": {
        "pt": "Trabalho aberto selecionado (OSS)",
        "en": "Selected open work (OSS)",
    },
    "summary": {
        "pt": (
            "PR aberto aws/integrations-on-dotnet-aspire-for-aws#247 (rotas HTTP reverse-proxy no "
            "emulador API Gateway). CLs no toolchain Go (runtime / gopls). Packs privados de "
            "hardening de runtime (fork/OTEL, failover, flakes de CI) com prova fail→pass — "
            "sem teatro de bounty farm."
        ),
        "en": (
            "Open PR aws/integrations-on-dotnet-aspire-for-aws#247 (HTTP reverse-proxy routes on "
            "the API Gateway emulator). Go toolchain CLs (runtime / gopls). Private runtime "
            "hardening packs (fork/OTEL, failover, CI flakes) with fail→pass proof — not bounty-farm theater."
        ),
    },
}

TECHNICAL_SKILLS = [
    "C#",
    ".NET 10",
    "Python",
    "pytest",
    "Go",
    "TypeScript",
    "React",
    "ASP.NET Web API",
    "FastAPI-class APIs",
    "Entity Framework",
    "PostgreSQL",
    "SQL Server",
    "Multi-Cloud / .NET Aspire",
    "AWS",
    "AWS Lambda",
    "Azure",
    "Docker / CI/CD",
    "GitHub Actions",
    "OpenTelemetry",
    "Envoy",
    "OIDC / Entra ID",
    "Microservices / SOA",
    "RESTful APIs",
    "DDD / Clean Architecture",
    "Design Patterns",
    "Identity & Access Management",
]

POLY_BULLETS_PT = [
    "Control plane tipado e composição multi-provedor (AWS, Azure, local) com dry-run antes de aplicar — o mesmo modelo do desenvolvimento local à cloud.",
    "Módulos de dados PostgreSQL/SQL Server e workloads AWS (incl. caminho Lambda/serverless no modelo Aspire), com Terraform/GitHub Actions nos planos de entrega.",
    "Frontends React estáticos no composition multi-cloud (ex.: storefront/lab travel) consumindo APIs e contratos tipados da plataforma.",
    "LifeGraph: catálogo de capacidades com claims e provas; app Android (AAB) em Play Internal Testing; observabilidade OpenTelemetry e quality gates.",
    "OSS e reliability: PR Aspire AWS #247; CLs Go; hardening de timeouts/concorrência/fork com regressão mensurável.",
]

POLY_BULLETS_EN = [
    "Typed control plane and multi-provider composition (AWS, Azure, local) with dry-run before apply — same model from local development to cloud.",
    "PostgreSQL/SQL Server data modules and AWS workloads (including Lambda/serverless path in the Aspire model), with Terraform/GitHub Actions in delivery plans.",
    "Static React frontends in multi-cloud composition (e.g. travel lab storefront) consuming platform APIs and typed contracts.",
    "LifeGraph: capability catalog with claims and proofs; Android app (AAB) on Play Internal Testing; OpenTelemetry observability and quality gates.",
    "OSS and reliability: AWS Aspire PR #247; Go CLs; timeout/concurrency/fork hardening with measurable regression.",
]

POLY_TECH = [
    "C#",
    ".NET 10",
    "ASP.NET Web API",
    "Python",
    "TypeScript",
    "React",
    "Entity Framework",
    "PostgreSQL",
    "SQL Server",
    "Microservices",
    "RESTful APIs",
    "DDD",
    "Clean Architecture",
    "Multi-Cloud Integration",
    ".NET Aspire",
    "AWS",
    "AWS Lambda",
    "Azure",
    "Docker",
    "CI/CD",
    "GitHub Actions",
    "Terraform",
    "OpenTelemetry",
    "Envoy",
    "OIDC",
]


def main() -> None:
    data = json.loads(CV_PATH.read_text(encoding="utf-8"))
    personal = data["personal"]
    personal["email"] = "msmourao@hotmail.com"
    personal["emailSecondary"] = "getpolystack@gmail.com"

    data["sections"]["about"] = {"pt": ABOUT_PT, "en": ABOUT_EN}

    achievements = data["sections"].get("achievements") or []
    achievements = [a for a in achievements if a.get("id") != "ach-open-work"]
    data["sections"]["achievements"] = [OPEN_WORK, *achievements]

    data["sections"]["skills"]["technical"] = TECHNICAL_SKILLS

    for job in data["sections"]["experience"]:
        if job.get("id") != "polyStack":
            continue
        job["bullets"] = {"pt": POLY_BULLETS_PT, "en": POLY_BULLETS_EN}
        job["technologies"] = POLY_TECH
        # keep LMS note shorter / less vendor-forward in summary
        job["summary"] = {
            "pt": (
                "Desenvolvimento independente da plataforma e control plane multi-cloud PolyStack "
                "(.NET 10 / Aspire, composição declarativa, Envoy, dry-run e governação operacional). "
                "Sibling LifeGraph: ProductOps, OpenTelemetry, quality gates, distribuição Android via "
                "Play Internal Testing e importação LMS (schema + export HTTP).\n\n"
                "https://getpolystack.com · https://getpolystack.com/ai"
            ),
            "en": (
                "Independent development of the PolyStack multi-cloud platform and control plane "
                "(.NET 10 / Aspire, declarative composition, Envoy, dry-run, and operational governance). "
                "LifeGraph sibling: ProductOps, OpenTelemetry, quality gates, Android distribution via "
                "Play Internal Testing, and LMS import (schema + HTTP export).\n\n"
                "https://getpolystack.com · https://getpolystack.com/ai"
            ),
        }
        break

    CV_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("updated", CV_PATH)


if __name__ == "__main__":
    main()
