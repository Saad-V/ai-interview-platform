from enum import Enum

from app.core.enums import InterviewDifficulty


INTERVIEW_DESIGN_VERSION = "rubric-v1"
RUBRIC_VERSION = "rubric-v1"
QUESTION_COUNT_ANCHORS = (
    (10, 4),
    (30, 8),
    (60, 14),
    (90, 18),
    (120, 22),
)
SECTION_WEIGHTS = {
    "INTRODUCTION": 10,
    "PROJECTS": 35,
    "TECHNICAL": 35,
    "BEHAVIORAL": 20,
}
RUBRIC_MAX_SCORES = {
    "ACCURACY": 4,
    "COVERAGE": 2,
    "REASONING": 2,
    "COMMUNICATION": 2,
}
TECHNICAL_CRITERIA = frozenset({"ACCURACY", "COVERAGE", "REASONING"})
TECHNICAL_MAX_SCORE = sum(RUBRIC_MAX_SCORES[key] for key in TECHNICAL_CRITERIA)
COMMUNICATION_MAX_SCORE = RUBRIC_MAX_SCORES["COMMUNICATION"]
QUESTION_MAX_SCORE = TECHNICAL_MAX_SCORE + COMMUNICATION_MAX_SCORE


class InterviewSectionCategory(str, Enum):
    INTRODUCTION = "INTRODUCTION"
    PROJECTS = "PROJECTS"
    TECHNICAL = "TECHNICAL"
    BEHAVIORAL = "BEHAVIORAL"


class RubricCriterionId(str, Enum):
    ACCURACY = "ACCURACY"
    COVERAGE = "COVERAGE"
    REASONING = "REASONING"
    COMMUNICATION = "COMMUNICATION"


DIFFICULTY_DEFINITIONS = {
    InterviewDifficulty.EASY: (
        "Fresher / entry-level (typically 0-1 years of relevant professional "
        "experience). Assess fundamentals, clear definitions, guided application, "
        "and basic reasoning. Do not expect production ownership or specialist depth."
    ),
    InterviewDifficulty.MEDIUM: (
        "Independent early-to-mid-level practitioner (typically 2-5 years of "
        "relevant experience). Assess practical application, trade-offs, debugging, "
        "and the ability to explain decisions with concrete examples."
    ),
    InterviewDifficulty.HARD: (
        "Experienced senior practitioner (typically 5+ years or equivalent depth). "
        "Assess system-level judgment, complex trade-offs, failure modes, security, "
        "scale, and the ability to defend decisions. Do not equate difficulty with "
        "obscure trivia."
    ),
}


def question_count_for_duration(duration_minutes: int) -> int:
    if not QUESTION_COUNT_ANCHORS[0][0] <= duration_minutes <= QUESTION_COUNT_ANCHORS[-1][0]:
        raise ValueError("Interview duration must be between 10 and 120 minutes.")

    for (lower_minutes, lower_count), (upper_minutes, upper_count) in zip(
        QUESTION_COUNT_ANCHORS,
        QUESTION_COUNT_ANCHORS[1:],
    ):
        if duration_minutes <= upper_minutes:
            elapsed = duration_minutes - lower_minutes
            span = upper_minutes - lower_minutes
            count_delta = upper_count - lower_count
            return lower_count + (elapsed * count_delta * 2 + span) // (2 * span)

    return QUESTION_COUNT_ANCHORS[-1][1]


def section_question_counts(question_count: int) -> dict[str, int]:
    if question_count < len(SECTION_WEIGHTS):
        raise ValueError("An interview needs at least four questions.")

    categories = list(SECTION_WEIGHTS)
    weight_total = sum(SECTION_WEIGHTS.values())
    weighted_counts = {
        category: question_count * SECTION_WEIGHTS[category]
        for category in categories
    }
    allocations = {
        category: weighted_counts[category] // weight_total
        for category in categories
    }
    unallocated = question_count - sum(allocations.values())
    ranked_categories = sorted(
        categories,
        key=lambda category: (
            -(weighted_counts[category] % weight_total),
            categories.index(category),
        ),
    )
    for category in ranked_categories[:unallocated]:
        allocations[category] += 1

    for category in categories:
        if allocations[category] == 0:
            donors = [item for item in categories if allocations[item] > 1]
            donor = max(
                donors,
                key=lambda item: (
                    allocations[item] * weight_total - weighted_counts[item],
                    allocations[item],
                    -categories.index(item),
                ),
            )
            allocations[donor] -= 1
            allocations[category] = 1

    return allocations


def recommendation_for_score(overall_percentage: float) -> str:
    if overall_percentage >= 85:
        return "Strong Hire"
    if overall_percentage >= 70:
        return "Hire"
    if overall_percentage >= 55:
        return "Borderline"
    return "No Hire"


def calculate_report_scores(evaluations: list[dict]) -> dict[str, int | float]:
    if not evaluations:
        raise ValueError("Cannot calculate a report without evaluated answers.")

    total_awarded = 0
    total_maximum = 0
    technical_awarded = 0
    communication_awarded = 0

    for evaluation in evaluations:
        if not isinstance(evaluation, dict):
            raise ValueError("Answer evaluations must be objects.")
        if evaluation.get("rubric_version") != RUBRIC_VERSION:
            raise ValueError("Every answer must use the current scoring rubric.")

        criteria = evaluation.get("criteria")
        if not isinstance(criteria, list):
            raise ValueError("A rubric criterion breakdown is required for every answer.")

        seen: set[str] = set()
        answer_awarded = 0
        answer_technical = 0
        answer_communication = 0
        for criterion in criteria:
            if not isinstance(criterion, dict):
                raise ValueError("Rubric criteria must be objects.")
            criterion_id = criterion.get("criterion_id")
            awarded_score = criterion.get("awarded_score")
            maximum_score = criterion.get("maximum_score")
            if criterion_id not in RUBRIC_MAX_SCORES or criterion_id in seen:
                raise ValueError("Answer contains an invalid or duplicate rubric criterion.")
            if maximum_score != RUBRIC_MAX_SCORES[criterion_id]:
                raise ValueError("Answer contains an invalid rubric criterion maximum.")
            if type(awarded_score) is not int or not (
                0 <= awarded_score <= RUBRIC_MAX_SCORES[criterion_id]
            ):
                raise ValueError("Answer contains a rubric score outside its allowed range.")
            seen.add(criterion_id)
            answer_awarded += awarded_score
            if criterion_id in TECHNICAL_CRITERIA:
                answer_technical += awarded_score
            else:
                answer_communication += awarded_score

        if seen != set(RUBRIC_MAX_SCORES):
            raise ValueError("Every rubric criterion must be scored exactly once per answer.")
        if (
            evaluation.get("awarded_score") != answer_awarded
            or evaluation.get("maximum_score") != QUESTION_MAX_SCORE
        ):
            raise ValueError("Stored answer totals do not match the rubric criterion scores.")
        expected_technical_percentage = round(
            answer_technical * 100 / TECHNICAL_MAX_SCORE,
            2,
        )
        expected_communication_percentage = round(
            answer_communication * 100 / COMMUNICATION_MAX_SCORE,
            2,
        )
        if (
            evaluation.get("technical_score") != answer_technical
            or evaluation.get("communication_score") != answer_communication
            or evaluation.get("score_percentage")
            != round(answer_awarded * 100 / QUESTION_MAX_SCORE, 2)
            or evaluation.get("technical_percentage") != expected_technical_percentage
            or evaluation.get("communication_percentage")
            != expected_communication_percentage
        ):
            raise ValueError("Stored answer percentages do not match the rubric criterion scores.")

        total_awarded += answer_awarded
        total_maximum += QUESTION_MAX_SCORE
        technical_awarded += answer_technical
        communication_awarded += answer_communication

    question_count = len(evaluations)
    return {
        "overall_score": round(total_awarded * 100 / total_maximum, 2),
        "technical_score": round(
            technical_awarded * 100 / (question_count * TECHNICAL_MAX_SCORE),
            2,
        ),
        "communication_score": round(
            communication_awarded * 100 / (question_count * COMMUNICATION_MAX_SCORE),
            2,
        ),
        "total_awarded_score": total_awarded,
        "total_maximum_score": total_maximum,
        "question_count": question_count,
    }
