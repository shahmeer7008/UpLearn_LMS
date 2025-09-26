import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy,
  Clock,
  Target
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizPlayerProps {
  quizId: string;
  title: string;
  onComplete: (score: number, passed: boolean) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizId, title, onComplete }) => {
  // Mock quiz data - in real app, this would come from props or API
  const mockQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the primary purpose of React hooks?',
      options: [
        'To replace class components entirely',
        'To manage state and side effects in functional components',
        'To improve performance of React applications',
        'To handle routing in React applications'
      ],
      correctAnswer: 1,
      explanation: 'React hooks allow you to use state and other React features in functional components, making them more powerful and easier to work with.'
    },
    {
      id: '2',
      question: 'Which hook is used for managing component state?',
      options: [
        'useEffect',
        'useContext',
        'useState',
        'useReducer'
      ],
      correctAnswer: 2,
      explanation: 'useState is the most basic hook for managing local component state in functional components.'
    },
    {
      id: '3',
      question: 'When does useEffect run by default?',
      options: [
        'Only on component mount',
        'Only on component unmount',
        'After every render',
        'Only when dependencies change'
      ],
      correctAnswer: 2,
      explanation: 'By default, useEffect runs after every render, both after the first render and after every update.'
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);

  const passingScore = 70; // 70% to pass
  const currentQuestion = mockQuestions[currentQuestionIndex];
  const totalQuestions = mockQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    setEndTime(Date.now());
    setShowResults(true);
    setQuizCompleted(true);

    const score = calculateScore();
    const passed = score >= passingScore;
    onComplete(score, passed);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    mockQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const getTimeTaken = () => {
    if (!endTime) return 0;
    return Math.round((endTime - startTime) / 1000 / 60); // minutes
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setEndTime(null);
  };

  const isAnswerCorrect = (questionId: string, answerIndex: number) => {
    const question = mockQuestions.find(q => q.id === questionId);
    return question?.correctAnswer === answerIndex;
  };

  const getSelectedAnswer = (questionId: string) => {
    return selectedAnswers[questionId];
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= passingScore;
    const timeTaken = getTimeTaken();

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <Target className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations!' : 'Quiz Complete'}
          </CardTitle>
          <CardDescription>
            {passed 
              ? 'You have successfully passed the quiz!' 
              : 'You can retake the quiz to improve your score.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{score}%</div>
                <p className="text-sm text-gray-600">Final Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockQuestions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length}/{totalQuestions}
                </div>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{timeTaken}m</div>
                <p className="text-sm text-gray-600">Time Taken</p>
              </CardContent>
            </Card>
          </div>

          {/* Pass/Fail Status */}
          <div className="text-center">
            <Badge 
              className={`text-lg px-4 py-2 ${
                passed 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {passed ? 'PASSED' : 'FAILED'} (Required: {passingScore}%)
            </Badge>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Answers</h3>
            {mockQuestions.map((question, index) => {
              const selectedAnswer = getSelectedAnswer(question.id);
              const isCorrect = selectedAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} className="border-l-4 border-l-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">
                          Question {index + 1}: {question.question}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Your answer:</span>{' '}
                            <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {question.options[selectedAnswer]}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              <span className="font-medium">Correct answer:</span>{' '}
                              <span className="text-green-600">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                              <span className="font-medium">Explanation:</span> {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {!passed && (
              <Button onClick={resetQuiz} className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {Math.round((Date.now() - startTime) / 1000 / 60)}m
            </span>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          <RadioGroup
            value={selectedAnswers[currentQuestion.id]?.toString() || ''}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion.id] === undefined}
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizPlayer;