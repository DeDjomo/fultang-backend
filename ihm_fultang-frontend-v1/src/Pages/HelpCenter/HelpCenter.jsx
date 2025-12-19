import { useNavigate } from "react-router-dom";
import ChatWindow from "../../GlobalComponents/ChatWindow.jsx";

export function HelpCenter () {


    const navigate = useNavigate(); 



  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <div className="border-b-2 m-3  border-b-gray-300">
                <div className="w-full h-[70px] flex justify-between">
                    <h1 className="ml-3 text-4xl text-secondary mt-3.5 font-bold">
                        Help Center
                    </h1>
                </div>
            </div>
            <div className="min-h-screen bg-gray-100">

      {/* Flèche de retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-800 hover:text-blue-900 mt-4 ml-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </button>


      {/* Barre de recherche */}
      <div className="container mx-auto mt-8 px-6">
        <input
          type="text"
          placeholder="Rechercher dans l'aide..."
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
        />
      </div>

      {/* Help Categories */}
        <div className="container mx-auto mt-8 px-6">
            <h2 className="text-xl font-semibold mb-4">Help Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Consultation & Appointments</h3>
                <p className="text-gray-600">Guide to scheduling or canceling an appointment.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Payments & Billing</h3>
                <p className="text-gray-600">Information on payments and refunds.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Technical Issues</h3>
                <p className="text-gray-600">Troubleshooting technical issues.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">FAQ</h3>
                <p className="text-gray-600">Answers to frequently asked questions.</p>
                </div>
            </div>
        </div>


      
      {/* Popular Articles */}
            <div className="container mx-auto mt-8 px-6">
                <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-medium">How to book an appointment?</h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-medium">How to check payment history?</h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-medium">What to do in case of a technical issue?</h3>
                    </div>
                </div>
            </div>

            {/* Customer Support */}
            <div className="container mx-auto mt-8 px-6">
                <h2 className="text-xl font-semibold mb-4">Customer Support</h2>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium mb-4">Contact Us</h3>
                    <form className="space-y-4">
                    <select className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select a topic</option>
                        <option>Technical issue</option>
                        <option>Billing</option>
                        <option>Other</option>
                    </select>
                    <textarea
                        placeholder="Describe your issue..."
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                    ></textarea>
                    <button
                        type="submit"
                        className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
                    >
                        Send
                    </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-primary-end text-white mt-8 py-6">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center">
                    <p>© 2025 Fultang Clinic. All rights reserved.</p>
                    </div>
                </div>
            </footer>

    </div>
    <ChatWindow />
    </div>
)
}