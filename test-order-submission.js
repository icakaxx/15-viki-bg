// Test script for order submission API
import fetch from 'node-fetch';

async function testOrderSubmission() {
  const testData = {
    personalInfo: {
      firstName: 'Иван',
      middleName: 'Петров',
      lastName: 'Димитров',
      phone: '0888123456'
    },
    invoiceInfo: {
      invoiceEnabled: true,
      companyName: 'ТЕСТ ЕООД',
      address: 'ул. Тестова 123, София 1000',
      bulstat: '123456789',
      mol: 'manager',
      molCustom: ''
    },
    paymentInfo: {
      paymentMethod: 'office'
    },
    cartItems: [
      {
        productId: 1,
        quantity: 2,
        serviceOption: 'ac-installation'
      },
      {
        productId: 2,
        quantity: 1,
        serviceOption: 'ac-only'
      }
    ],
    sessionId: 'test_session_' + Date.now()
  };

  console.log('🧪 Testing order submission API...');
  console.log('📦 Test data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/submit-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('\n📡 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: Order submitted successfully!');
      console.log(`🆔 Order ID: ${result.orderId}`);
    } else {
      console.log('\n❌ ERROR: Order submission failed');
      console.log('💬 Error message:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('\n💥 NETWORK ERROR:', error.message);
    console.log('\n🔍 Make sure your Next.js server is running on localhost:3000');
    console.log('   Run: npm run dev');
  }
}

// Test with invoice disabled as well
async function testOrderWithoutInvoice() {
  const testData = {
    personalInfo: {
      firstName: 'Мария',
      middleName: 'Георгиева',
      lastName: 'Стоянова',
      phone: '0899987654'
    },
    invoiceInfo: {
      invoiceEnabled: false,
      companyName: '',
      address: '',
      bulstat: '',
      mol: '',
      molCustom: ''
    },
    paymentInfo: {
      paymentMethod: 'cash'
    },
    cartItems: [
      {
        productId: 3,
        quantity: 1,
        serviceOption: 'ac-only'
      }
    ],
    sessionId: 'test_session_no_invoice_' + Date.now()
  };

  console.log('\n\n🧪 Testing order submission WITHOUT invoice...');
  console.log('📦 Test data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/submit-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('\n📡 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: Order without invoice submitted successfully!');
      console.log(`🆔 Order ID: ${result.orderId}`);
    } else {
      console.log('\n❌ ERROR: Order submission failed');
      console.log('💬 Error message:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('\n💥 NETWORK ERROR:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testOrderSubmission();
  await testOrderWithoutInvoice();
  
  console.log('\n🏁 Tests completed!');
}

runTests(); 