import { useNavigate } from 'react-router-dom';


const NotFoundPage = () => {
    const navigate = useNavigate();


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
                    404
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-3">
                    Introuvable
                </h1>

                <p className="text-gray-600 mb-8">
                    Page Introuvable
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
                >
                    retour
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;