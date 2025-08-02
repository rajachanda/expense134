import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import signupIllustration from '../assets/undraw_observations_cv73.svg';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Left Half - Image */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700">
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <img
              src={signupIllustration}
              alt="Signup Illustration"
              className="max-w-full max-h-80 object-contain mx-auto mb-8"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start your journey with us and manage your expenses effectively
            </p>
          </div>
        </div>
      </div>

      {/* Right Half - Form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up to start tracking your expenses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full pr-10"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field w-full pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
