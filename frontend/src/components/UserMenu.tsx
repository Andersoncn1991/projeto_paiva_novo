import React from 'react';
import { Avatar, Dropdown, Menu, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined, ShoppingOutlined, RestOutlined } from '@ant-design/icons';

// Exemplo de props, pode ser adaptado para contexto global depois
interface UserMenuProps {
  nome: string;
  avatarUrl?: string;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ nome, avatarUrl, onLogout }) => {
  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout} danger>
        Sair
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Badge dot offset={[-2, 32]} style={{ backgroundColor: '#52c41a' }}>
            <Avatar
              size={40}
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{ background: '#fff', border: '2px solid #e53935', color: '#e53935' }}
            />
          </Badge>
          <span style={{ fontWeight: 700, color: '#232323', fontSize: 18, marginLeft: 8 }}>
            Olá, {nome.split(' ')[0]}
          </span>
        </div>
      </Dropdown>
    </div>
  );
};

export default UserMenu;
