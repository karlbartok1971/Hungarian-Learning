"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WritingCategory = exports.ExerciseType = exports.ProgressStatus = exports.FeedbackType = exports.SermonStatus = exports.VocabularyCategory = exports.LessonType = exports.LearningGoal = exports.CEFRLevel = void 0;
var CEFRLevel;
(function (CEFRLevel) {
    CEFRLevel["A1"] = "A1";
    CEFRLevel["A2"] = "A2";
    CEFRLevel["B1"] = "B1";
    CEFRLevel["B2"] = "B2";
})(CEFRLevel || (exports.CEFRLevel = CEFRLevel = {}));
var LearningGoal;
(function (LearningGoal) {
    LearningGoal["SERMON_WRITING"] = "sermon_writing";
    LearningGoal["CONVERSATION"] = "conversation";
    LearningGoal["READING_COMPREHENSION"] = "reading_comprehension";
    LearningGoal["PRONUNCIATION"] = "pronunciation";
    LearningGoal["GRAMMAR"] = "grammar";
    LearningGoal["VOCABULARY"] = "vocabulary";
})(LearningGoal || (exports.LearningGoal = LearningGoal = {}));
var LessonType;
(function (LessonType) {
    LessonType["GRAMMAR"] = "grammar";
    LessonType["VOCABULARY"] = "vocabulary";
    LessonType["PRONUNCIATION"] = "pronunciation";
    LessonType["WRITING"] = "writing";
    LessonType["READING"] = "reading";
    LessonType["LISTENING"] = "listening";
    LessonType["SERMON_PRACTICE"] = "sermon_practice";
})(LessonType || (exports.LessonType = LessonType = {}));
var VocabularyCategory;
(function (VocabularyCategory) {
    VocabularyCategory["RELIGIOUS"] = "religious";
    VocabularyCategory["DAILY_LIFE"] = "daily_life";
    VocabularyCategory["ACADEMIC"] = "academic";
    VocabularyCategory["BUSINESS"] = "business";
    VocabularyCategory["FAMILY"] = "family";
    VocabularyCategory["FOOD"] = "food";
    VocabularyCategory["TRAVEL"] = "travel";
    VocabularyCategory["EMOTIONS"] = "emotions";
    VocabularyCategory["TIME"] = "time";
    VocabularyCategory["NUMBERS"] = "numbers";
})(VocabularyCategory || (exports.VocabularyCategory = VocabularyCategory = {}));
var SermonStatus;
(function (SermonStatus) {
    SermonStatus["DRAFT"] = "draft";
    SermonStatus["REVIEW"] = "review";
    SermonStatus["COMPLETED"] = "completed";
})(SermonStatus || (exports.SermonStatus = SermonStatus = {}));
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["GRAMMAR"] = "grammar";
    FeedbackType["VOCABULARY"] = "vocabulary";
    FeedbackType["STYLE"] = "style";
    FeedbackType["THEOLOGICAL"] = "theological";
    FeedbackType["CULTURAL"] = "cultural";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
var ProgressStatus;
(function (ProgressStatus) {
    ProgressStatus["NOT_STARTED"] = "not_started";
    ProgressStatus["IN_PROGRESS"] = "in_progress";
    ProgressStatus["COMPLETED"] = "completed";
    ProgressStatus["MASTERED"] = "mastered";
})(ProgressStatus || (exports.ProgressStatus = ProgressStatus = {}));
var ExerciseType;
(function (ExerciseType) {
    ExerciseType["MULTIPLE_CHOICE"] = "multiple_choice";
    ExerciseType["FILL_BLANK"] = "fill_blank";
    ExerciseType["TRANSLATION"] = "translation";
    ExerciseType["PRONUNCIATION"] = "pronunciation";
    ExerciseType["WRITING"] = "writing";
    ExerciseType["LISTENING"] = "listening";
})(ExerciseType || (exports.ExerciseType = ExerciseType = {}));
var WritingCategory;
(function (WritingCategory) {
    WritingCategory["PERSONAL"] = "personal";
    WritingCategory["FORMAL"] = "formal";
    WritingCategory["ACADEMIC"] = "academic";
    WritingCategory["SERMON"] = "sermon";
    WritingCategory["LETTER"] = "letter";
    WritingCategory["STORY"] = "story";
})(WritingCategory || (exports.WritingCategory = WritingCategory = {}));
//# sourceMappingURL=index.js.map