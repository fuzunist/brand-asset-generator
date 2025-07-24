import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const EmbedCodeModal = ({ isOpen, onClose, embedCode, surveyQuestion }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="div" className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        Embed Survey Widget
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </Dialog.Title>

                                <div className="space-y-6">
                                    {/* Survey Info */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Survey Question:</p>
                                        <p className="text-sm font-medium text-gray-900">{surveyQuestion}</p>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                            How to embed this survey on your website:
                                        </h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                            <li>Copy the embed code below</li>
                                            <li>Paste it into your website's HTML where you want the survey to appear</li>
                                            <li>The widget will automatically load and display your survey</li>
                                        </ol>
                                    </div>

                                    {/* Embed Code */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-900">
                                                Embed Code
                                            </label>
                                            <CopyToClipboard text={embedCode} onCopy={handleCopy}>
                                                <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                                    {copied ? (
                                                        <>
                                                            <CheckIcon className="h-4 w-4 mr-1" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                                                            Copy to clipboard
                                                        </>
                                                    )}
                                                </button>
                                            </CopyToClipboard>
                                        </div>
                                        <div className="relative">
                                            <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono">
                                                <code>{embedCode}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                                            Widget Features:
                                        </h4>
                                        <ul className="space-y-1 text-sm text-blue-800">
                                            <li>✓ Lightweight (< 20kb)</li>
                                            <li>✓ CSS isolated - won't affect your site's styles</li>
                                            <li>✓ Mobile responsive</li>
                                            <li>✓ Duplicate vote prevention</li>
                                            <li>✓ Real-time results tracking</li>
                                        </ul>
                                    </div>

                                    {/* Preview Note */}
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium mb-1">Note:</p>
                                        <p>
                                            The widget will appear as a small, unobtrusive popup in the bottom-right 
                                            corner of your website. Users can easily close it if they don't want to 
                                            participate.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EmbedCodeModal;