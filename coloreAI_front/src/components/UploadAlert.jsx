import { Button } from './ui';

const ALERT_CONFIG = {
  'invalid-format': {
    icon: '⚠️',
    title: 'Formato não suportado',
    message:
      'Apenas arquivos JPG e PNG são aceitos. Selecione um arquivo no formato correto.',
    color: 'border-warning/30 bg-warning/5',
  },

  'too-large': {
    icon: '📦',
    title: 'Arquivo muito grande',
    message:
      'O arquivo excede o limite de 10 MB. Comprima ou redimensione a imagem antes de enviar.',
    color: 'border-warning/30 bg-warning/5',
  },

  'already-colored': {
    icon: '🎨',
    title: 'Imagem já colorida',
    message:
      'Esta imagem parece não estar em preto e branco. Deseja prosseguir mesmo assim ou escolher outra imagem?',
    color: 'border-info/30 bg-info/5',
  },

  'upload-failed': {
    icon: '🔌',
    title: 'Falha no envio',
    message:
      'Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.',
    color: 'border-error/30 bg-error/5',
  },
};

export default function UploadAlert({
  type,
  onDismiss,
  onRetry,
  onProceed,
}) {
  const config = ALERT_CONFIG[type];

  return (
    <div className={`rounded-xl border px-4 py-3.5 ${config.color}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5">
          {config.icon}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-fg">
            {config.title}
          </p>

          <p className="text-sm text-fg-muted mt-0.5 leading-relaxed">
            {config.message}
          </p>

          <div className="flex gap-2 mt-3">
            {type === 'upload-failed' && onRetry && (
              <Button size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            )}

            {type === 'already-colored' && onProceed && (
              <Button size="sm" onClick={onProceed}>
                Prosseguir mesmo assim
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
            >
              {type === 'already-colored'
                ? 'Trocar imagem'
                : 'Fechar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}