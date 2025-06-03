import TextUpload from "../components/TextUpload.tsx";


const UploadPage = () => {
    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Upload a Text</h1>
            <TextUpload />
        </div>
    )
}

export default UploadPage

