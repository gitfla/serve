"use client"

import TextUpload from "../../components/text-upload";
import TextAdmin from "../../components/text-admin";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function UploadPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 flex flex-col items-center space-y-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Manage Your Texts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <TextUpload />
                    <div className="border-t pt-8 border-gray-200">
                        <TextAdmin />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
