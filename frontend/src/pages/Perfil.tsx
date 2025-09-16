import InputMask from 'react-input-mask';
import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Button, Spin, Alert, Form, Input, Row, Col, message, Modal, Upload, Tooltip, Divider } from 'antd';
import { UserOutlined, UploadOutlined, DeleteOutlined, QuestionCircleOutlined, HomeOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Função utilitária para permitir só números
const onlyNumbers = (value: string) => value.replace(/\D/g, '');

// Componente de input de celular com máscara fixa e formatação garantida
const PhoneInput: React.FC<any> = (props) => {
  function formatPhone(value: string) {
    const raw = onlyNumbers(value).slice(0, 11);
    if (raw.length < 3) return raw;
    if (raw.length <= 7) return `(${raw.slice(0,2)}) ${raw.slice(2)}`;
    if (raw.length <= 11) return `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`;
    return `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7,11)}`;
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    props.onChange && props.onChange({ ...e, target: { ...e.target, value: formatted } });
  };
  return (
    <InputMask
      mask="(99) 99999-9999"
      maskChar={null}
      value={props.value}
      onChange={handleChange}
      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('Text');
        const formatted = formatPhone(text);
        props.onChange && props.onChange({ ...e, target: { ...e.target, value: formatted } });
      }}
    >
      {(inputProps: any) => <Input {...inputProps} inputMode="numeric" maxLength={15} />}
    </InputMask>
  );
};

// Função para formatar CEP como 99999-999
function formatCep(value: string) {
  const raw = onlyNumbers(value).slice(0, 8);
  if (raw.length <= 5) return raw;
  return raw.slice(0, 5) + '-' + raw.slice(5);
}

// Componente de input de CEP com máscara e formatação automática
const CepInput: React.FC<any> = (props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    props.onChange && props.onChange({ ...e, target: { ...e.target, value: formatted } });
  };
  return (
    <InputMask
      mask="99999-999"
      maskChar={null}
      value={props.value}
      onChange={handleChange}
      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('Text');
        const formatted = formatCep(text);
        props.onChange && props.onChange({ ...e, target: { ...e.target, value: formatted } });
      }}
    >
      {(inputProps: any) => <Input {...inputProps} inputMode="numeric" maxLength={9} />}
    </InputMask>
  );
};

// Regras de senha forte
const passwordRules = [
  { regex: /.{8,}/, label: 'Mínimo 8 caracteres' },
  { regex: /[A-Z]/, label: 'Pelo menos 1 letra maiúscula' },
  { regex: /[a-z]/, label: 'Pelo menos 1 letra minúscula' },
  { regex: /[0-9]/, label: 'Pelo menos 1 número' },
  { regex: /[^A-Za-z0-9]/, label: 'Pelo menos 1 caractere especial' },
];

const Perfil: React.FC = () => {
  const { user, logout, handleSessionExpired } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [senhaModal, setSenhaModal] = useState(false);
  const [senhaLoading, setSenhaLoading] = useState(false);
  const [senhaValue, setSenhaValue] = useState('');
  const [confirmarSenhaValue, setConfirmarSenhaValue] = useState('');
  const [form] = Form.useForm();
  const [senhaForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDados() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const resp = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.status === 401) {
          handleSessionExpired();
          return;
        }
        if (!resp.ok) throw new Error('Erro ao buscar dados do usuário');
        const data = await resp.json();
        setDados(data);
        setAvatarUrl(data.avatarUrl || null);
        setCreatedAt(data.created_at || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDados();
  }, [handleSessionExpired]);

  const getSafeData = (dadosUsuario: any) => {
    if (!dadosUsuario) return {};
    return {
      nome: dadosUsuario.nome || '',
      email: dadosUsuario.email || '',
      telefone: dadosUsuario.telefone || '',
      rua: dadosUsuario.rua || '',
      numero: dadosUsuario.numero || '',
      complemento: dadosUsuario.complemento || '',
      bairro: dadosUsuario.bairro || '',
      cidade: dadosUsuario.cidade || '',
      cep: dadosUsuario.cep || '',
    };
  };

  const preencherFormulario = (dadosUsuario: any) => {
    const safeData = getSafeData(dadosUsuario);
    form.setFieldsValue(safeData);
  };

  const entrarEdicao = () => {
    preencherFormulario(dados);
    setEditMode(true);
  };

  useEffect(() => {
    if (editMode && dados) {
      preencherFormulario(dados);
    }
  }, [editMode, dados]);

  // Upload de avatar
  const handleAvatarChange = async (info: any) => {
    if (info.file.status === 'uploading') {
      setAvatarLoading(true);
      return;
    }
    if (info.file.status === 'done' || info.file.originFileObj) {
      setAvatarLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', info.file.originFileObj || info.file);
        const resp = await fetch('http://127.0.0.1:8000/auth/avatar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (resp.status === 401) {
          handleSessionExpired();
          return;
        }
        if (!resp.ok) throw new Error('Erro ao enviar avatar');
        const data = await resp.json();
        setAvatarUrl(data.avatarUrl || data.avatar_url || null);
        message.success('Avatar atualizado!');
      } catch (err: any) {
        message.error('Erro ao enviar avatar.');
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  // Excluir conta
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch('http://127.0.0.1:8000/auth/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!resp.ok) throw new Error('Erro ao excluir conta');
      setDeleteLoading(false);
      Modal.success({ title: 'Conta excluída', content: 'Sua conta foi removida com sucesso.' });
      logout();
    } catch (err: any) {
      setDeleteLoading(false);
      message.error('Erro ao excluir conta.');
    }
  };

  // Editar dados
  const handleEdit = async (_: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const currentValues = form.getFieldsValue(true);
      // Sempre enviar todos os campos (se estiver vazio mantém vazio para permitir preencher depois)
      const payload = { ...currentValues };
      const resp = await fetch('http://127.0.0.1:8000/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (resp.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!resp.ok) throw new Error('Erro ao atualizar dados');
      const respJson = await resp.json();
      const novosDados = respJson.data ? respJson.data : { ...dados, ...payload };
      setDados(novosDados);
      // Repreenche formulário com possíveis normalizações (ex: trim)
      preencherFormulario(novosDados);
      message.success('Dados atualizados!');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trocar senha
  const handleTrocarSenha = async (values: any) => {
    setSenhaLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch('http://127.0.0.1:8000/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senha: values.novaSenha, confirmacao_senha: values.confirmarSenha }),
      });
      if (resp.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!resp.ok) throw new Error('Erro ao trocar senha');
      message.success('Senha alterada com sucesso!');
      setSenhaModal(false);
      senhaForm.resetFields();
      setSenhaValue('');
      setConfirmarSenhaValue('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSenhaLoading(false);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert type="error" message={error} style={{ margin: 32 }} />;

  return (
    <div style={{ maxWidth: 1400, margin: '40px auto', padding: '0 16px', display: 'flex', justifyContent: 'center' }}>
      <Card bordered style={{ maxWidth: 1050, width: '100%', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 0, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{
              width: 104, height: 104, borderRadius: '50%', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #e53935',
              boxShadow: '0 2px 8px #0002',
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserOutlined style={{ fontSize: 54, color: '#bbb' }} />
              )}
            </div>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
              style={{ position: 'absolute', bottom: 0, right: 0 }}
            >
              <Tooltip title="Alterar foto">
                <Button
                  icon={<UploadOutlined />}
                  size="small"
                  style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: '50%', background: '#fff', border: '1px solid #e53935', color: '#e53935', boxShadow: '0 1px 4px #0002' }}
                  loading={avatarLoading}
                />
              </Tooltip>
            </Upload>
          </div>
          <Typography.Title level={3} style={{ textAlign: 'center', margin: 0 }}>{dados?.nome}</Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 15 }}>{dados?.email}</Typography.Text>
          {createdAt && <Typography.Text style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Cadastrado em: {new Date(createdAt).toLocaleDateString()}</Typography.Text>}
        </div>
        <Divider style={{ margin: '12px 0' }} />
        {/* BLOCO BONITO DE DADOS DO CLIENTE */}
        {!editMode && dados && (
          <div style={{
            marginBottom: 24,
            padding: '18px 48px',
            background: '#f8f8f8',
            borderRadius: 12,
            boxShadow: '0 1px 6px #0001',
            fontSize: 17,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'flex-start',
            wordBreak: 'break-word',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserOutlined style={{ fontSize: 22, color: '#e53935' }} />
              <div>
                <Typography.Text strong>Nome:</Typography.Text> <span>{dados.nome || '—'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MailOutlined style={{ fontSize: 22, color: '#e53935' }} />
              <div>
                <Typography.Text strong>Email:</Typography.Text> <span>{dados.email || '—'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PhoneOutlined style={{ fontSize: 22, color: '#e53935' }} />
              <div>
                <Typography.Text strong>Celular:</Typography.Text> <span>{dados.telefone || 'Não informado'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <HomeOutlined style={{ fontSize: 22, color: '#e53935', marginTop: 2 }} />
              <div style={{ width: '100%' }}>
                <span style={{ fontWeight: 600 }}>Endereço:</span>
                <span style={{ marginLeft: 8, fontSize: 16 }}>
                  {dados.rua || '—'}, {dados.numero || '—'}{dados.complemento ? ` - ${dados.complemento}` : ''}
                </span>
                <div style={{ marginTop: 2, fontSize: 16 }}>
                  {dados.bairro || '—'}, {dados.cidade || '—'}, {dados.cep || '—'}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* FIM BLOCO BONITO */}
        {editMode && (
          <Form
            key={`perfil-form-${dados?.id || 'x'}-${dados?.rua || ''}-${dados?.numero || ''}-${dados?.bairro || ''}-${dados?.cidade || ''}-${dados?.cep || ''}`}
            layout="vertical"
            form={form}
            initialValues={getSafeData(dados)}
            onFinish={handleEdit}
            style={{ marginBottom: 16 }}
          >
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item label="Nome completo" name="nome">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="E-mail" name="email">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Celular" name="telefone" rules={[{ required: true, message: 'Informe o celular!' }, {
                  validator: (_, value) => {
                    if (!value || value.trim() === '') return Promise.resolve();
                    if (/^\(\d{2}\) \d{5}-\d{4}$/.test(value)) return Promise.resolve();
                    return Promise.reject('Celular inválido! Use o formato (99) 99999-9999');
                  }
                }]}
                valuePropName="value"
                >
                  <PhoneInput />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Rua/Avenida" name="rua" rules={[{ required: true, message: 'Informe a rua/avenida!' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Número" name="numero" rules={[{ required: true, message: 'Informe o número!' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Complemento" name="complemento">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Bairro" name="bairro" rules={[{ required: true, message: 'Informe o bairro!' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Cidade" name="cidade" rules={[{ required: true, message: 'Informe a cidade!' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="CEP" name="cep" rules={[
                  { required: true, message: 'Informe o CEP!' },
                  { pattern: /^\d{5}-\d{3}$/, message: 'CEP inválido!' }
                ]} valuePropName="value">
                  <CepInput />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col span={12}><Button block onClick={() => setEditMode(false)}>Cancelar</Button></Col>
              <Col span={12}><Button type="primary" htmlType="submit" block>Salvar</Button></Col>
            </Row>
          </Form>
        )}
        <Divider style={{ margin: '12px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
          {!editMode && (
            <>
              <Button
                size="large"
                block
                style={{
                  fontWeight: 700,
                  background: '#fff',
                  color: '#232323',
                  border: '2px solid #232323',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#e53935'; e.currentTarget.style.borderColor = '#e53935'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#232323'; e.currentTarget.style.borderColor = '#232323'; }}
                onClick={entrarEdicao}
              >Editar Dados</Button>
              <Button
                size="large"
                block
                style={{
                  fontWeight: 700,
                  background: '#fff',
                  color: '#232323',
                  border: '2px solid #232323',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#e53935'; e.currentTarget.style.borderColor = '#e53935'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#232323'; e.currentTarget.style.borderColor = '#232323'; }}
                onClick={() => setSenhaModal(true)}
              >Trocar Senha</Button>
              <Button
                size="large"
                block
                icon={<QuestionCircleOutlined />}
                style={{
                  fontWeight: 700,
                  background: '#fff',
                  color: '#232323',
                  border: '2px solid #232323',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#e53935'; e.currentTarget.style.borderColor = '#e53935'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#232323'; e.currentTarget.style.borderColor = '#232323'; }}
                onClick={() => window.open('mailto:contato@paivas.com.br?subject=Ajuda%20e%20Suporte', '_blank')}
              >Ajuda e Suporte</Button>
              <Button
                size="large"
                block
                icon={<DeleteOutlined />}
                style={{
                  fontWeight: 700,
                  background: '#fff',
                  color: '#232323',
                  border: '2px solid #232323',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#e53935'; e.currentTarget.style.borderColor = '#e53935'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#232323'; e.currentTarget.style.borderColor = '#232323'; }}
                onClick={() => setDeleteModal(true)}
              >Excluir Conta</Button>
              <Button
                size="large"
                block
                style={{
                  fontWeight: 700,
                  background: '#fff',
                  color: '#232323',
                  border: '2px solid #232323',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#e53935'; e.currentTarget.style.borderColor = '#e53935'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#232323'; e.currentTarget.style.borderColor = '#232323'; }}
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Sair
              </Button>
            </>
          )}
        </div>
      </Card>
            {/* Modal de senha */}
      <Modal
        open={senhaModal}
        title="Trocar Senha"
        onCancel={() => {
          setSenhaModal(false);
          setSenhaValue('');
          setConfirmarSenhaValue('');
          senhaForm.resetFields();
        }}
        footer={null}
      >
        <Form layout="vertical" form={senhaForm} onFinish={handleTrocarSenha}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Senha"
                name="novaSenha"
                rules={[{ required: true, message: 'Informe a senha!' }]}
                hasFeedback
              >
                <Input.Password
                  autoComplete="new-password"
                  placeholder="Senha"
                  value={senhaValue}
                  onChange={e => setSenhaValue(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Confirme a senha"
                name="confirmarSenha"
                dependencies={["novaSenha"]}
                hasFeedback
                rules={[
                  { required: true, message: 'Confirme a senha!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('novaSenha') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject('As senhas não coincidem!');
                    }
                  })
                ]}
              >
                <Input.Password
                  autoComplete="new-password"
                  placeholder="Confirme a senha"
                  value={confirmarSenhaValue}
                  onChange={e => setConfirmarSenhaValue(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ marginTop: -8, marginBottom: 12, width: '100%' }}>
            {passwordRules.map(rule => (
              <div
                key={rule.label}
                style={{
                  color: rule.regex.test(senhaValue) ? '#52c41a' : '#999',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {rule.regex.test(senhaValue) ? '✔️' : '○'} {rule.label}
              </div>
            ))}
          </div>
          <Button type="primary" htmlType="submit" loading={senhaLoading} block
            disabled={
              !senhaValue ||
              !confirmarSenhaValue ||
              senhaValue !== confirmarSenhaValue ||
              !passwordRules.every(rule => rule.regex.test(senhaValue))
            }
          >Salvar Senha</Button>
        </Form>
      </Modal>
      {/* Modal de exclusão de conta */}
      <Modal
        open={deleteModal}
        title="Excluir Conta"
        onCancel={() => setDeleteModal(false)}
        footer={null}
      >
        <Typography.Text strong style={{ color: '#e53935' }}>
          Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.
        </Typography.Text>
        <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={() => setDeleteModal(false)}>Cancelar</Button>
          <Button danger loading={deleteLoading} onClick={handleDeleteAccount}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}

export default Perfil;