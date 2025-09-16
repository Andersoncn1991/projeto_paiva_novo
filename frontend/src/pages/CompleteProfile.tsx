// Função para checar status das regras de senha (igual ao Register)
const getPasswordStatus = (senha: string) => passwordRules.map(rule => rule.regex.test(senha));
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Alert, Typography, Row, Col, Checkbox, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
// Validação de senha forte
const passwordRules = [
  { regex: /.{8,}/, label: 'Mínimo 8 caracteres' },
  { regex: /[A-Z]/, label: 'Pelo menos 1 letra maiúscula' },
  { regex: /[a-z]/, label: 'Pelo menos 1 letra minúscula' },
  { regex: /[0-9]/, label: 'Pelo menos 1 número' },
  { regex: /[^A-Za-z0-9]/, label: 'Pelo menos 1 caractere especial' },
];
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { apiFetch } from '../services/api';
// Função utilitária para permitir só números
const onlyNumbers = (value: string) => value.replace(/\D/g, '');

// Componente de input de celular com máscara fixa e formatação garantida
const PhoneInput: React.FC<any> = (props) => {
  // Máscara fixa para celular brasileiro
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

interface CompleteProfileProps {
  token?: string;
}

// Função para bloquear edição de campos
const ReadOnlyInput = (props: any) => <Input {...props} readOnly style={{ background: '#f5f5f5' }} />;

import { useLocation } from 'react-router-dom';

const CompleteProfile: React.FC<CompleteProfileProps> = (props) => {
  // Permite receber token por props ou pela query string
  const location = useLocation();
  function getTokenFromQuery() {
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }
  const token = props.token || getTokenFromQuery();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Removido o state user
  const [welcome, setWelcome] = useState(false);
  const [form] = Form.useForm();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aceiteTermosChecked, setAceiteTermosChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar dados do usuário logado
    async function fetchUser() {
      try {
        const resp = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          let body = '';
          try { body = await resp.text(); } catch {}
          setError(`Erro ao buscar dados do usuário (status ${resp.status}): ${body}`);
          return;
        }
        const data = await resp.json();
        // Preenche nome e email automaticamente se vierem do Google
        const safeData = {
          ...data,
          nome: data.nome || '',
          email: data.email || '',
          rua: data.rua || '',
          numero: data.numero !== undefined && data.numero !== null ? String(data.numero) : '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          cep: data.cep || '',
          telefone: data.telefone || '',
        };
        form.setFieldsValue(safeData);
      } catch (err: any) {
        setError('Erro inesperado ao buscar dados do usuário: ' + err.message);
      }
    }
    if (token) {
      fetchUser();
    } else {
      setError('Token de autenticação não encontrado. Faça login novamente.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      if (!token) throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      // Adiciona senha se preenchida
      const body = { ...values, telefone: onlyNumbers(values.telefone) };
      if (password) body.senha = password;
      const resp = await fetch('http://127.0.0.1:8000/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        let bodyText = '';
        try { bodyText = await resp.text(); } catch {}
        setError(`Erro ao atualizar cadastro (status ${resp.status}): ${bodyText}`);
        return;
      }
      const data = await resp.json();
      // Após cadastro, busca dados completos do usuário via /auth/me
      try {
        const token = localStorage.getItem('access_token');
        const respMe = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (respMe.ok) {
          const userData = await respMe.json();
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch {}
  setSuccess(true);
  setWelcome(true);
  message.success('Cadastro realizado com sucesso! Faça login para continuar.', 2);
  // Remove token e dados do usuário para evitar login automático
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError('Erro inesperado ao atualizar cadastro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ maxWidth: 500, margin: '40px auto', marginBottom: 80 }}>
      <Typography.Title level={3}>Complete seu cadastro</Typography.Title>
      <Form layout="vertical" onFinish={onFinish} form={form}>
        {/* Campos pessoais e endereço (apenas uma vez) */}
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item label="Nome completo" name="nome">
              <ReadOnlyInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="E-mail" name="email">
              <ReadOnlyInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="Celular (WhatsApp)"
              name="telefone"
              rules={[
                { required: true, message: 'Informe o celular!' },
                {
                  validator: (_, value) => {
                    if (!value || value.trim() === '') return Promise.resolve();
                    if (/^\(\d{2}\) \d{5}-\d{4}$/.test(value)) return Promise.resolve();
                    return Promise.reject('Celular inválido! Use o formato (99) 99999-9999');
                  }
                }
              ]}
              valuePropName="value"
            >
              <PhoneInput />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Rua/Avenida" 
              name="rua" 
              rules={[ 
                { required: true, message: 'Informe a rua!' },
                { min: 2, message: 'A rua deve ter pelo menos 2 caracteres.' }
              ]}
            > 
              <Input /> 
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item 
              label="Número" 
              name="numero" 
              rules={[ 
                { required: true, message: 'Informe o número!' },
                { min: 1, message: 'O número deve ter pelo menos 1 caractere.' }
              ]}
            > 
              <Input /> 
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              label="Bairro" 
              name="bairro" 
              rules={[ 
                { required: true, message: 'Informe o bairro!' },
                { min: 2, message: 'O bairro deve ter pelo menos 2 caracteres.' }
              ]}
            > 
              <Input /> 
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              label="Cidade" 
              name="cidade" 
              rules={[ 
                { required: true, message: 'Informe a cidade!' },
                { min: 2, message: 'A cidade deve ter pelo menos 2 caracteres.' }
              ]}
            > 
              <Input /> 
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="CEP" name="cep" rules={[
              { required: true, message: 'Informe o CEP!' },
              { pattern: /^\d{5}-\d{3}$/, message: 'CEP inválido!' }
            ]} valuePropName="value">
              <CepInput />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Complemento" name="complemento"> <Input /> </Form.Item>
          </Col>
        </Row>
        {/* Campos de senha no final, apenas uma vez */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="Senha"
              name="senha"
              rules={[{ required: true, message: 'Informe a senha!' }]}
              hasFeedback
            >
              <Input.Password
                autoComplete="new-password"
                placeholder="Senha"
                onChange={e => setPassword(e.target.value)}
                value={password}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Confirme a senha"
              name="confirmacao_senha"
              dependencies={["senha"]}
              hasFeedback
              rules={[
                { required: true, message: 'Confirme a senha!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('senha') === value) {
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
                onChange={e => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ marginTop: -8, marginBottom: 12, width: '100%' }}>
          {passwordRules.map(rule => (
            <div
              key={rule.label}
              style={{
                color: rule.regex.test(password) ? '#52c41a' : '#999',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {rule.regex.test(password) ? '✔️' : '○'} {rule.label}
            </div>
          ))}
        </div>
        {/* Aceite dos termos e botões */}
        <Form.Item
          name="aceite_termos"
          valuePropName="checked"
          rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('É necessário aceitar os termos para continuar.') }]}
          style={{ marginBottom: 12 }}
        >
          <Checkbox
            checked={aceiteTermosChecked}
            onChange={e => setAceiteTermosChecked(e.target.checked)}
          >
            Li e aceito os <a href="/privacidade" target="_blank" rel="noopener noreferrer">Termos de Uso e Política de Privacidade</a>.
          </Checkbox>
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Button type="default" block onClick={() => navigate('/login')}>Trocar de conta</Button>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              disabled={
                !password ||
                !confirmPassword ||
                password !== confirmPassword ||
                !getPasswordStatus(password).every(Boolean) ||
                !aceiteTermosChecked
              }
            >Salvar</Button>
          </Col>
        </Row>
      </Form>
      {success && <Alert type="success" message="Cadastro realizado com sucesso!" style={{ marginTop: 16 }} />}
      {error && <Alert type="error" message={error} style={{ marginTop: 16 }} />}
    </div>
  );
};

export default CompleteProfile;
