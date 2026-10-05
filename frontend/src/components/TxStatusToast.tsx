import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, X, ExternalLink } from 'lucide-react';
import { TransactionStatus } from '../types/auction';

interface TxStatusToastProps {
  status: TransactionStatus;
  onDismiss: () => void;
}

export const TxStatusToast: React.FC<TxStatusToastProps> = ({ status, onDismiss }) => {
  if (status.state === 'idle' || !status.message) return null;

  const isPending = status.state === 'pending';
  const isSuccess = status.state === 'success';
  const isError = status.state === 'error';

  const bgColor = isPending
    ? 'rgba(99, 102, 241, 0.15)'
    : isSuccess
    ? 'rgba(16, 185, 129, 0.15)'
    : 'rgba(244, 63, 94, 0.15)';

  const borderColor = isPending
    ? 'rgba(99, 102, 241, 0.4)'
    : isSuccess
    ? 'rgba(16, 185, 129, 0.4)'
    : 'rgba(244, 63, 94, 0.4)';

  const textColor = isPending
    ? '#818cf8'
    : isSuccess
    ? '#34d399'
    : '#f87171';

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        maxWidth: '440px',
        width: 'calc(100% - 48px)',
        zIndex: 9999,
        background: bgColor,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div style={{ marginTop: '2px' }}>
        {isPending && (
          <RefreshCw style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px', color: textColor }} />
        )}
        {isSuccess && (
          <CheckCircle2 style={{ width: '20px', height: '20px', color: textColor }} />
        )}
        {isError && (
          <AlertCircle style={{ width: '20px', height: '20px', color: textColor }} />
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', textTransform: 'capitalize' }}>
          {isPending ? 'Transaction Processing' : isSuccess ? 'Transaction Confirmed' : 'Transaction Alert'}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.4 }}>
          {status.message}
        </div>

        {status.hash && (
          <a
            href={`https://etherscan.io/tx/${status.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem',
              color: '#818cf8',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            View on Etherscan <ExternalLink style={{ width: '12px', height: '12px' }} />
          </a>
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
      >
        <X style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  );
};
