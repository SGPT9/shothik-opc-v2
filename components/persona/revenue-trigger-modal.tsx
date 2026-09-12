'use client';

import React, { useState } from 'react';
import { RevenueTrigger } from './use-persona';

interface RevenueTriggerModalProps {
  triggers: RevenueTrigger[];
  onDismiss: () => void;
  onPayment: (trigger: RevenueTrigger) => Promise<void>;
}

/**
 * Revenue Trigger Payment Modal
 * 
 * Displays contextual payment prompts at moments of peak operational pain.
 * Supports bKash, Nagad, and card payments with micro-transaction amounts.
 * 
 * Examples:
 * - "Submission tomorrow? Unlock unlimited paraphrasing for 50 BDT"
 * - "Automated Reconciliation & COD Protection - 499 BDT/month"
 */
export function RevenueTriggerModal({ 
  triggers, 
  onDismiss, 
  onPayment 
}: RevenueTriggerModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);

  if (triggers.length === 0) return null;

  // Sort by urgency
  const sortedTriggers = [...triggers].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const primaryTrigger = sortedTriggers[0];

  const handlePayment = async () => {
    setIsProcessing(true);
    setSelectedTrigger(primaryTrigger.triggerId);
    try {
      await onPayment(primaryTrigger);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
      setSelectedTrigger(null);
    }
  };

  // Urgency color mapping
  const urgencyColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with urgency indicator */}
        <div className={`h-2 ${
          primaryTrigger.urgency === 'critical' ? 'bg-red-500' :
          primaryTrigger.urgency === 'high' ? 'bg-orange-500' :
          primaryTrigger.urgency === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
        }`}></div>
        
        <div className="p-6">
          {/* Title and Icon */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚡</span>
            <h2 className="text-xl font-bold text-gray-900">
              {primaryTrigger.title}
            </h2>
          </div>

          {/* Message */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {primaryTrigger.message}
          </p>

          {/* Price and Payment Method */}
          <div className={`rounded-lg p-4 mb-6 ${urgencyColors[primaryTrigger.urgency]}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-gray-900">
                ৳{primaryTrigger.amount}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Payment via:</span>
              <span className="font-semibold capitalize">
                {primaryTrigger.paymentMethod === 'bkash' && 'bKash'}
                {primaryTrigger.paymentMethod === 'nagad' && 'Nagad'}
                {primaryTrigger.paymentMethod === 'card' && 'Credit/Debit Card'}
              </span>
            </div>
          </div>

          {/* Additional triggers (if multiple) */}
          {sortedTriggers.length > 1 && (
            <div className="mb-6 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Other offers:
              </p>
              {sortedTriggers.slice(1).map(trigger => (
                <div key={trigger.triggerId} className="text-sm text-gray-600 flex justify-between">
                  <span>{trigger.title}</span>
                  <span className="font-semibold">৳{trigger.amount}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              disabled={isProcessing}
            >
              Maybe Later
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span>💳</span>
                  Pay ৳{primaryTrigger.amount}
                </>
              )}
            </button>
          </div>

          {/* Trust indicators */}
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Secure payment via {primaryTrigger.paymentMethod === 'bkash' ? 'bKash' : primaryTrigger.paymentMethod === 'nagad' ? 'Nagad' : 'Card'} • Instant activation
          </p>
        </div>
      </div>
    </div>
  );
}

export default RevenueTriggerModal;
