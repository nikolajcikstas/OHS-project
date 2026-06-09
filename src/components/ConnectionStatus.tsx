interface Props {
  connected: boolean;
}

export function ConnectionStatus({ connected }: Props) {
  return (
    <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
      <i className={`bi bi-wifi${connected ? '' : '-off'}`} />
      <span>{connected ? 'Подключено к серверу' : 'Ошибка соединения с сервером'}</span>
    </div>
  );
}
