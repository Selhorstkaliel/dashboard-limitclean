import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'kalielselhorst@example.com' }
  });

  if (existingAdmin) {
    console.log('🔍 Admin user already exists, skipping creation.');
    return;
  }

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      nome: 'Kaliel Selhorst',
      email: 'kalielselhorst@example.com',
      senhaHash: await argon2.hash('Kaskolk14'),
      papel: 'ADMIN',
      cpfCnpj: '12345678901',
      twofaEnabled: false,
    },
  });

  console.log('✅ Admin user created:', {
    id: adminUser.id,
    nome: adminUser.nome,
    email: adminUser.email,
    papel: adminUser.papel
  });

  // Create sample clients (optional)
  const sampleClients = await prisma.client.createMany({
    data: [
      {
        nome: 'João Silva',
        cpfCnpj: '12345678901',
        email: 'joao@example.com',
        status: 'RESTRICAO',
        telefonesJson: ['(11) 99999-9999'],
      },
      {
        nome: 'Maria Santos',
        cpfCnpj: '98765432100',
        email: 'maria@example.com',
        status: 'FINALIZADO',
        telefonesJson: ['(11) 88888-8888'],
      },
      {
        nome: 'Empresa ABC Ltda',
        cpfCnpj: '12345678000190',
        email: 'contato@empresaabc.com',
        status: 'REPROTOCOLO',
        telefonesJson: ['(11) 77777-7777'],
      },
    ],
  });

  console.log(`✅ Created ${sampleClients.count} sample clients`);

  console.log('🎉 Seed completed successfully!');
  console.log('📧 Admin login: kalielselhorst@example.com');
  console.log('🔒 Admin password: Kaskolk14');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });