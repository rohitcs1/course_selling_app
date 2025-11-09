import React from 'react'

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
      <p className="text-gray-700 mb-3">By purchasing courses on this site you agree to our terms and conditions. Access to course materials is provided after successful payment. Sharing of access links is prohibited. Refunds are subject to our refund policy.</p>
      <h2 className="text-xl font-semibold mt-4">Payment & Access</h2>
      <ul className="list-disc ml-6 text-gray-700">
        <li>Payments are processed via our payment gateway in live mode.</li>
        <li>Course access links will be sent to the email used for payment.</li>
        <li>We may revoke access for abuse or violation of terms.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-4">Privacy</h2>
      <p className="text-gray-700">We collect basic customer details for the purpose of payment and delivering course content. We do not share your personal data with third parties except for payment providers.</p>
    </div>
  )
}

export default Terms
