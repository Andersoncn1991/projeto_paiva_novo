
import React, { useEffect, useState } from 'react';
import { Button, Modal, Checkbox } from 'antd';

const defaultPrefs = {
  essenciais: true,
  analytics: false,
  marketing: false,
};

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('cookie_prefs');
    return saved ? JSON.parse(saved) : defaultPrefs;
  });

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_prefs', JSON.stringify({ ...defaultPrefs, analytics: true, marketing: true }));
    setVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_prefs', JSON.stringify({ ...defaultPrefs, analytics: false, marketing: false }));
    setVisible(false);
  };

  const handleSavePrefs = () => {
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_prefs', JSON.stringify(prefs));
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      centered
      style={{ top: 100, padding: 0 }}
      width={440}
      bodyStyle={{ padding: 0, background: 'transparent' }}
      modalRender={node => (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 32px #0001', maxWidth: 440, margin: 'auto', padding: 0 }}>
          {node}
        </div>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 28 }}>
        <h2 style={{ marginBottom: 8 }}>Sua privacidade é importante para nós</h2>
        <p style={{ fontSize: 15, marginBottom: 16 }}>
          Utilizamos cookies para garantir o funcionamento seguro e eficiente do site, autenticação de usuários e análise de uso. Você pode <b>aceitar todos</b>, <b>rejeitar</b> ou <b>personalizar</b> suas preferências. Cookies essenciais são obrigatórios para o funcionamento do site e não podem ser desativados.<br />
          Saiba mais em nossa <a href="/cookies" target="_blank" rel="noopener noreferrer">Política de Cookies</a>.
        </p>
        <div style={{ marginBottom: 18, background: '#f6f6f6', borderRadius: 6, padding: 12 }}>
          <Checkbox checked disabled style={{ fontWeight: 500 }}>Cookies essenciais (obrigatório)</Checkbox><br />
          <Checkbox checked={prefs.analytics} onChange={e => setPrefs((p: any) => ({ ...p, analytics: e.target.checked }))}>Cookies de análise de uso (analytics)</Checkbox><br />
          <Checkbox checked={prefs.marketing} onChange={e => setPrefs((p: any) => ({ ...p, marketing: e.target.checked }))}>Cookies de marketing</Checkbox>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 0, flexWrap: 'nowrap' }}>
          <Button onClick={handleRejectAll}>Rejeitar todos</Button>
          <Button onClick={handleAcceptAll} type="primary">Aceitar todos</Button>
          <Button onClick={handleSavePrefs}>Salvar preferências</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CookieConsent;
