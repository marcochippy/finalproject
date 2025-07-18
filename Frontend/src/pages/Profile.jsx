import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { useRef } from 'react';
import { AuthContext } from '../context/index.js';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileAndWorkouts = async () => {
      setIsLoading(true);
      try {
        const BACKEND_URL = import.meta.env.VITE_API_URL;

        const userRes = await fetch(`${BACKEND_URL}/auth/me`, { credentials: 'include' });
        if (!userRes.ok) throw new Error('Failed to fetch user info');
        const userData = await userRes.json();

        if (userData.image && !userData.image.startsWith('http')) {
          userData.image = `${BACKEND_URL}${userData.image}`;
          console.log(userData);
        }
        setUser(userData);

        const userId = userData._id;
        const workoutsRes = await fetch(`${BACKEND_URL}/logs/users/${userId}`, {
          credentials: 'include'
        });
        if (!workoutsRes.ok) throw new Error('Failed to fetch recent workouts');
        const workoutsData = await workoutsRes.json();
        const workouts = workoutsData.Logs
          ? workoutsData.Logs.sort(
              (a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
            ).slice(0, 4)
          : [];
        setRecentWorkouts(workouts);
      } catch (error) {
        console.error('Error fetching profile or workouts:', error.message);
        setRecentWorkouts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndWorkouts();
  }, []);

  const { logout } = useContext(AuthContext);
  const handleLogout = async () => {
    await logout();
    setTimeout(() => {
      window.location.href = '/';
    }, 1200);
  };
  const handleImageUpload = async e => {
    const BACKEND_URL = import.meta.env.VITE_API_URL;
    const file = e.target.files[0];

    if (!file) {
      console.error('No file selected');
      return;
    }

    console.log('Uploading file:', file.name, 'Size:', file.size);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${BACKEND_URL}/users/${user._id}/image`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) {
        const updatedUser = await res.json();
        console.log('Upload successful, updated user:', updatedUser);
        setUser(updatedUser); // Update state with new profile image
      } else {
        const errorData = await res.json();
        console.error('Upload failed:', res.status, errorData);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  const fileInputRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const openWorkoutModal = workout => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  const closeWorkoutModal = () => {
    setSelectedWorkout(null);
    setIsModalOpen(false);
  };

  const capitalizeWords = str => {
    if (!str) return '';
    const withSpaces = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    return withSpaces.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="bg-[#121212] text-white min-h-screen pt-safe pb-5 w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="flex flex-col relative items-center justify-center text-center mb-8">
          {/* Camera icon bottom-right */}
          <div
            className="absolute top-17 z-5 right-30 bg-[#F2AB40] rounded-full w-7 h-7 flex items-center pl-1 justify-center shadow-md"
            onClick={handleImageClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7h2l2-3h6l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
              />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#F2AB40] to-[#e09b2d] cursor-pointer shadow-lg ring-4 ring-[#F2AB40]/20"
            onClick={handleImageClick}
          >
            {user?.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-black">{user?.name?.[0] || '?'}</span>
            )}
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <h2 className="text-3xl font-bold mt-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            {user?.name || 'User'}
          </h2>
          <p className="text-gray-400 text-base font-medium">{user?.email}</p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">Recent Workouts</h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <p className="text-gray-400">Loading workouts...</p>
                </div>
              </div>
            ) : recentWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No recent workouts</p>
                <p className="text-gray-400 text-sm">Start your fitness journey!</p>
              </div>
            ) : (
              recentWorkouts.map((workout, idx) => {
                const totalSets = workout.completedSets?.length || 0;
                const totalExercises = workout.exercises?.length || 0;
                const duration = workout.duration ? Math.round(workout.duration / 60) : null;

                return (
                  <div
                    key={workout._id || idx}
                    onClick={() => openWorkoutModal(workout)}
                    className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white text-lg">{workout.planName || 'Workout'}</h4>
                      <span className="text-xs bg-[#F2AB40] text-black px-2 py-1 rounded-full font-medium">
                        {new Date(workout.completedAt || workout.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>{totalExercises} exercises</span>
                      <span>{totalSets} sets</span>
                      <span>{duration ? `${duration} min` : '--'}</span>
                    </div>

                    {workout.exercises?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          {workout.exercises
                            .slice(0, 2)
                            .map(ex => capitalizeWords(ex.name))
                            .join(', ')}
                          {workout.exercises.length > 2 && `, +${workout.exercises.length - 2} more`}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-15">
        <button
          onClick={handleLogout}
          className="bg-[#F2AB40] hover:bg-[#e09b2d] text-base font-semibold text-white py-2 px-6 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Workout Detail Modal */}
      {isModalOpen && selectedWorkout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeWorkoutModal}
        >
          <div
            className="bg-[#1a1a1a] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-600"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-600 flex justify-between items-center sticky top-0 bg-[#1a1a1a]">
              <h3 className="text-xl font-bold text-white">{selectedWorkout.planName || 'Workout Details'}</h3>
              <button
                onClick={closeWorkoutModal}
                className="text-gray-400 hover:text-[#F2AB40] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Workout Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#F2AB40]">{selectedWorkout.exercises?.length || 0}</p>
                  <p className="text-xs text-gray-400">Exercises</p>
                </div>
                <div className="text-center p-3 bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#F2AB40]">{selectedWorkout.completedSets?.length || 0}</p>
                  <p className="text-xs text-gray-400">Sets</p>
                </div>
                <div className="text-center p-3 bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#F2AB40]">
                    {selectedWorkout.duration ? Math.round(selectedWorkout.duration / 60) + 'm' : '--'}
                  </p>
                  <p className="text-xs text-gray-400">Duration</p>
                </div>
              </div>

              {/* Workout Date */}
              <div className="mb-6 p-3 bg-[#2a2a2a] rounded-lg text-center">
                <p className="text-white font-medium">
                  {new Date(selectedWorkout.completedAt || selectedWorkout.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* All Exercises */}
              {selectedWorkout.exercises?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">All Exercises</h4>
                  <div className="space-y-3">
                    {selectedWorkout.exercises.map((exercise, idx) => (
                      <div key={idx} className="p-3 bg-[#2a2a2a] rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-white">{capitalizeWords(exercise.name)}</h5>
                          <span className="text-xs bg-[#F2AB40] text-black px-2 py-1 rounded">
                            {exercise.totalSetsCompleted || 0} sets
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">Target: {capitalizeWords(exercise.target || 'N/A')}</p>
                        {exercise.equipment && (
                          <p className="text-gray-400 text-sm">Equipment: {capitalizeWords(exercise.equipment)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
