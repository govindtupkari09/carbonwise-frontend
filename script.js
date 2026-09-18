const LAMBDA_URL =
    "https://u23uyxwhqyldi6m6blffuqlxnq0gxgno.lambda-url.ap-south-1.on.aws/";

async function uploadFile() {

    const fileInput = document.getElementById("fileInput");
    const status = document.getElementById("status");
    const uploadBtn = document.getElementById("uploadBtn");

    const file = fileInput.files[0];

    if (!file) {
        status.textContent = "Please select an image or PDF.";
        return;
    }

    // Maximum file size: 5 MB
    if (file.size > 5 * 1024 * 1024) {
        status.textContent = "File size must be less than 5 MB.";
        return;
    }

    uploadBtn.disabled = true;
    status.textContent = "Uploading...";

    try {

        const base64Data = await convertToBase64(file);

        const response = await fetch(LAMBDA_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain"
            },

            body: base64Data

        });

        const data = await response.json();

        console.log("Lambda response:", data);

        if (response.ok && data.status === "success") {

            status.textContent =
                "File uploaded successfully to S3.";

            console.log("S3 file:", data.file);

        } else {

            status.textContent =
                data.message || "Upload failed.";

        }

    } catch (error) {

        console.error(error);

        status.textContent =
            "Upload failed. Please try again.";

    } finally {

        uploadBtn.disabled = false;
    }
}


function convertToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {

            // Remove:
            // data:image/jpeg;base64,
            // data:application/pdf;base64,

            const base64String =
                reader.result.split(",")[1];

            resolve(base64String);

        };

        reader.onerror = () => {
            reject(reader.error);
        };

        reader.readAsDataURL(file);
    });
}