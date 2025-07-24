import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateSurveyModal = ({ isOpen, onClose, onSubmit }) => {
    const [question, setQuestion] = useState('');
    const [type, setType] = useState('poll');
    const [pollOptions, setPollOptions] = useState({ option1: 'Yes', option2: 'No' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!question.trim()) {
            return;
        }

        setSubmitting(true);
        
        const surveyData = {
            question: question.trim(),
            type,
            options: type === 'poll' ? pollOptions : undefined
        };

        await onSubmit(surveyData);
        
        // Reset form
        setQuestion('');
        setType('poll');
        setPollOptions({ option1: 'Yes', option2: 'No' });
        setSubmitting(false);
    };

    const handleClose = () => {
        if (!submitting) {
            onClose();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="div" className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        Create New Survey
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </Dialog.Title>

                                <form onSubmit={handleSubmit}>
                                    {/* Question Input */}
                                    <div className="mb-4">
                                        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                                            Survey Question
                                        </label>
                                        <textarea
                                            id="question"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                            placeholder="e.g., Do you find our new pricing plans clear?"
                                            required
                                        />
                                    </div>

                                    {/* Survey Type */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Survey Type
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="poll"
                                                    checked={type === 'poll'}
                                                    onChange={(e) => setType(e.target.value)}
                                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">Two-Option Poll</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="rating"
                                                    checked={type === 'rating'}
                                                    onChange={(e) => setType(e.target.value)}
                                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">5-Star Rating</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Poll Options (only show for poll type) */}
                                    {type === 'poll' && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Poll Options
                                            </label>
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={pollOptions.option1}
                                                    onChange={(e) => setPollOptions({ ...pollOptions, option1: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Option 1"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={pollOptions.option2}
                                                    onChange={(e) => setPollOptions({ ...pollOptions, option2: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Option 2"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                        <p className="text-sm text-gray-900 mb-2">{question || 'Your question will appear here'}</p>
                                        {type === 'poll' ? (
                                            <div className="flex gap-2">
                                                <button type="button" className="flex-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                                                    {pollOptions.option1}
                                                </button>
                                                <button type="button" className="flex-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                                                    {pollOptions.option2}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className="text-gray-300 text-xl">★</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || !question.trim()}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {submitting ? 'Creating...' : 'Create Survey'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CreateSurveyModal;