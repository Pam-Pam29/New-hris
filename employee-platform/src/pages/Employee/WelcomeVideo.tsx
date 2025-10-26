import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Play, CheckCircle } from 'lucide-react';

interface WelcomeVideoProps {
    onComplete: (data: any) => void;
}

const WelcomeVideo: React.FC<WelcomeVideoProps> = ({ onComplete }) => {
    const [videoWatched, setVideoWatched] = useState(false);

    const handleVideoComplete = () => {
        setVideoWatched(true);
    };

    const handleContinue = () => {
        onComplete({ videoWatched: true });
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to Our Company! 🎉
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                    Let's start your journey with a brief introduction to our company culture and values.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Video Placeholder */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                            <h3 className="text-xl font-semibold mb-2">Company Welcome Video</h3>
                            <p className="text-gray-300 mb-4">
                                Duration: 3-5 minutes
                            </p>
                            <Button
                                onClick={handleVideoComplete}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Watch Video
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Video Content Summary */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">What you'll learn:</h4>
                    <ul className="space-y-2 text-blue-800">
                        <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                            Our company mission and values
                        </li>
                        <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                            What makes us unique
                        </li>
                        <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                            Your role in our success
                        </li>
                        <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                            What to expect in your first week
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center pt-4">
                    {videoWatched ? (
                        <Button
                            onClick={handleContinue}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Continue to Next Step
                        </Button>
                    ) : (
                        <p className="text-gray-500 italic">
                            Please watch the video to continue
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default WelcomeVideo;
