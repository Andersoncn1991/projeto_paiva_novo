
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Checkbox, Row, Col } from 'antd';
import { message } from 'antd';
import InputMask from 'react-input-mask';
import { useForm, useWatch } from 'antd/es/form/Form';

const passwordRules = [
  { regex: /.{8,}/, label: 'Mínimo 8 caracteres' },
  { regex: /[A-Z]/, label: 'Pelo menos 1 letra maiúscula' },
  { regex: /[a-z]/, label: 'Pelo menos 1 letra minúscula' },
  { regex: /[0-9]/, label: 'Pelo menos 1 número' },
  { regex: /[^A-Za-z0-9]/, label: 'Pelo menos 1 caractere especial' },
];

const onlyNumbers = (value: string) => value.replace(/\D/g, '');

const PhoneInput: React.FC<any> = ({ value, onChange, ...rest }) => {
  function formatPhone(val: string) {
    const raw = onlyNumbers(val).slice(0, 11);
    if (raw.length < 3) return raw;
    if (raw.length <= 7) return `(${raw.slice(0,2)}) ${raw.slice(2)}`;
    if (raw.length <= 11) return `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`;
    return `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7,11)}`;
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange && onChange(formatted);
  };
  return (
    <InputMask
      mask="(99) 99999-9999"
      maskChar={null}
      value={value}
      onChange={handleChange}
      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('Text');
        const formatted = formatPhone(text);
        onChange && onChange(formatted);
      }}
      {...rest}
    >
      {(inputProps: any) => <Input {...inputProps} inputMode="numeric" maxLength={15} />}
    </InputMask>
  );
};

function formatCep(value: string) {
  const raw = onlyNumbers(value).slice(0, 8);
  if (raw.length <= 5) return raw;
  return raw.slice(0, 5) + '-' + raw.slice(5);
}

const CepInput: React.FC<any> = ({ value, onChange, ...rest }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    onChange && onChange(formatted);
  };
  return (
    <InputMask
      mask="99999-999"
      maskChar={null}
      value={value}
      onChange={handleChange}
      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('Text');
        const formatted = formatCep(text);
        onChange && onChange(formatted);
      }}
      {...rest}
    >
      {(inputProps: any) => <Input {...inputProps} inputMode="numeric" maxLength={9} />}
    </InputMask>
  );
};

function capitalizarNome(nome: string) {
  return nome.replace(/\b(\w)/g, (l) => l.toUpperCase());
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = useForm();
  const senhaValue = useWatch('senha', form) || '';
  const [aceiteTermosChecked, setAceiteTermosChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const senhaValida = passwordRules.every(rule => rule.regex.test(values.senha));
      if (!senhaValida) {
        setError('A senha não atende aos requisitos de segurança.');
        setLoading(false);
        return;
      }
      if (values.senha !== values.confirmacao_senha) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }
      if (!values.aceite_termos) {
        setError('É necessário aceitar os termos de uso e política de privacidade.');
        setLoading(false);
        return;
      }
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: capitalizarNome(values.nome),
          email: values.email,
          telefone: onlyNumbers(values.telefone),
          rua: values.rua,
          numero: values.numero,
          complemento: values.complemento,
          bairro: values.bairro,
          cidade: values.cidade,
          cep: values.cep,
          senha: values.senha,
          confirmacao_senha: values.confirmacao_senha,
          aceite_termos: values.aceite_termos,
          role: 'cliente',
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao cadastrar usuário');
      }
      setSuccess(true);
      form.resetFields();
      message.success('Cadastro realizado com sucesso!', 2);
      // Redireciona para a tela de origem, se houver (ex: /carrinho), senão para home
      const from = location.state?.from;
      setTimeout(() => {
        if (from) {
          navigate(from);
        } else {
          navigate('/');
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px #0001', padding: 32 }}>
      <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Cadastro</Typography.Title>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form layout="vertical" onFinish={onFinish} autoComplete="off" form={form} style={{ width: '100%' }}>
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item label="Nome completo" name="nome" rules={[
              { required: true, message: 'Informe o nome completo!' },
              { min: 3, message: 'O nome deve ter pelo menos 3 caracteres.' }
            ]}>
              <Input placeholder="Seu nome completo" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="E-mail" 
              name="email" 
              rules={[ 
                { required: true, message: 'Informe o e-mail!' },
                { 
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    // Regex aceita letras, números, underline, ponto, hífen, arroba, e domínios .com.br, .com, etc
                    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
                    if (emailRegex.test(value.trim())) return Promise.resolve();
                    return Promise.reject('Informe um e-mail válido!');
                  }
                }
              ]}
            >
              <Input placeholder="email@exemplo.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Celular" name="telefone" rules={[
              { required: true, message: 'Informe o celular!' },
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') return Promise.resolve();
                  if (/^\(\d{2}\) \d{5}-\d{4}$/.test(value)) return Promise.resolve();
                  return Promise.reject('Celular inválido! Use o formato (99) 99999-9999');
                }
              }
            ]}>
              <PhoneInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={16}>
            <Form.Item label="Rua/Avenida" name="rua" rules={[
              { required: true, message: 'Informe a rua!' },
              { min: 2, message: 'A rua deve ter pelo menos 2 caracteres.' }
            ]}>
              <Input placeholder="Rua/Avenida" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Número" name="numero" rules={[
              { required: true, message: 'Informe o número!' },
              { pattern: /^\d+$/, message: 'O número deve conter apenas dígitos.' }
            ]}>
              <Input placeholder="Número" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Complemento" name="complemento">
              <Input placeholder="Complemento (opcional)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Bairro" name="bairro" rules={[
              { required: true, message: 'Informe o bairro!' },
              { min: 2, message: 'O bairro deve ter pelo menos 2 caracteres.' }
            ]}>
              <Input placeholder="Bairro" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Cidade" name="cidade" rules={[
              { required: true, message: 'Informe a cidade!' },
              { min: 2, message: 'A cidade deve ter pelo menos 2 caracteres.' }
            ]}>
              <Input placeholder="Cidade" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="CEP" name="cep" rules={[
              { required: true, message: 'Informe o CEP!' },
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') return Promise.resolve();
                  if (/^\d{5}-\d{3}$/.test(value)) return Promise.resolve();
                  return Promise.reject('CEP inválido! Use o formato 99999-999');
                }
              }
            ]}>
              <CepInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Senha" name="senha" rules={[{ required: true, message: 'Informe a senha!' }]}
              hasFeedback>
              <Input.Password autoComplete="new-password" placeholder="Senha" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Confirme a senha" name="confirmacao_senha" dependencies={["senha"]} rules={[
              { required: true, message: 'Confirme a senha!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('senha') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('As senhas não coincidem!');
                }
              })
            ]} hasFeedback>
              <Input.Password autoComplete="new-password" placeholder="Confirme a senha" />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ marginTop: -8, marginBottom: 12, width: '100%' }}>
          {passwordRules.map(rule => (
            <div key={rule.label} style={{ color: rule.regex.test(senhaValue) ? '#52c41a' : '#999', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              {rule.regex.test(senhaValue) ? '✔️' : '○'} {rule.label}
            </div>
          ))}
        </div>
        <Form.Item name="aceite_termos" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('É necessário aceitar os termos!') }]}
          style={{ marginBottom: 8 }}>
          <Checkbox
            checked={aceiteTermosChecked}
            onChange={e => setAceiteTermosChecked(e.target.checked)}
          >
            Li e aceito os <a href="/privacidade" target="_blank" rel="noopener noreferrer">termos de uso e política de privacidade</a>.
          </Checkbox>
        </Form.Item>
        <Button
          type="default"
          htmlType="submit"
          loading={loading}
          block
          style={{
            marginTop: 8,
            fontWeight: 700,
            fontSize: 16,
            background: '#fff',
            color: '#232323',
            borderColor: '#232323',
            borderWidth: 2,
            borderRadius: 8,
            width: '100%',
            transition: 'all 0.2s',
            outline: 'none',
            boxShadow: 'none',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#e53935';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e53935';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#232323';
          }}
          onFocus={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#232323';
          }}
          onBlur={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#232323';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#232323';
          }}
          disabled={!aceiteTermosChecked}
        >Cadastrar</Button>
      </Form>
      {success && <Alert type="success" message="Cadastro realizado com sucesso!" style={{ marginTop: 16, fontSize: 18, fontWeight: 600, textAlign: 'center' }} />}
      {error && <Alert type="error" message={error} style={{ marginTop: 16 }} />}
    </div>
  );
};

export default Register;
