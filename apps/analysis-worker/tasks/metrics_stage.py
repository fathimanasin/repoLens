def calculate_architecture_score(
    modules: list,
    circular_deps: list,
) -> dict:
    """
    Returns dict matching RepositoryAnalysis fields:
    { architecture_score, total_files, total_lines, total_modules,
      coupling_score, complexity_score, violation_count,
      circular_dep_count }
    """

    total = len(modules)

    if total == 0:
        return {
            "architecture_score": 100.0,
            "total_files": 0,
            "total_lines": 0,
            "total_modules": 0,
            "coupling_score": 0.0,
            "complexity_score": 0.0,
            "violation_count": 0,
            "circular_dep_count": 0,
        }

    avg_outbound = (
        sum(len(m.imports) for m in modules)
        / total
    )

    avg_complexity = (
        sum(m.line_count for m in modules)
        / total
        / 50
    )

    violations = sum(
        1
        for m in modules
        if (
            len(m.imports) > 10
            or m.line_count > 500
        )
    )

    circular_count = len(circular_deps)

    coupling_penalty = min(
        25.0,
        avg_outbound * 2.5,
    )

    complexity_penalty = min(
        25.0,
        avg_complexity * 2.0,
    )

    violation_penalty = min(
        25.0,
        violations * 1.5,
    )

    circular_penalty = min(
        25.0,
        circular_count * 5.0,
    )

    score = max(
        0.0,
        round(
            100
            - coupling_penalty
            - complexity_penalty
            - violation_penalty
            - circular_penalty,
            1,
        ),
    )

    return {
        "architecture_score": score,
        "total_files": total,
        "total_lines": sum(
            m.line_count
            for m in modules
        ),
        "total_modules": total,
        "coupling_score": round(
            avg_outbound,
            2,
        ),
        "complexity_score": round(
            avg_complexity,
            2,
        ),
        "violation_count": violations,
        "circular_dep_count": circular_count,
    }