/* eslint-disable no-unsafe-optional-chaining */
import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload } from "lucide-react";
import { useContext, useRef } from "react";

function CourseCurriculum() {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);

  function handleNewLecture() {
    setCourseCurriculumFormData([
      ...courseCurriculumFormData,
      {
        ...courseCurriculumInitialFormData[0],
      },
    ]);
  }

  function handleCourseTitleChange(event, currentIndex) {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    console.log(copyCourseCurriculumFormData, "copyCourseCurriculumFormData");
    copyCourseCurriculumFormData[currentIndex] = {
      ...copyCourseCurriculumFormData[currentIndex],
      title: event.target.value,
    };

    setCourseCurriculumFormData(copyCourseCurriculumFormData);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    console.log(currentValue, currentIndex);
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    console.log(copyCourseCurriculumFormData, "copyCourseCurriculumFormData");
    copyCourseCurriculumFormData[currentIndex] = {
      ...copyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };

    setCourseCurriculumFormData(copyCourseCurriculumFormData);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    console.log(event.target.files);
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          videoFormData,
          setMediaUploadProgressPercentage
        );
        if (response.success) {
          let copyCourseCurriculumFormData = [...courseCurriculumFormData];
          copyCourseCurriculumFormData[currentIndex] = {
            ...copyCourseCurriculumFormData[currentIndex],
            videoUrl: response?.data?.url,
            public_id: response?.data?.public_id,
          };
          setCourseCurriculumFormData(copyCourseCurriculumFormData);
          setMediaUploadProgress(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  console.log(courseCurriculumFormData);

  async function handleReplaceVideo(currentIndex) {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentVideoPublicId =
      copyCourseCurriculumFormData[currentIndex].public_id;

    const deleteCurrentMediaResponse = await mediaDeleteService(
      getCurrentVideoPublicId
    );

    console.log(deleteCurrentMediaResponse, "deleteCurrentMediaResponse");

    if (deleteCurrentMediaResponse?.success) {
      copyCourseCurriculumFormData[currentIndex] = {
        ...copyCourseCurriculumFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };

      setCourseCurriculumFormData(copyCourseCurriculumFormData);
    }
  }

  function isCourseCurriculumFormDataValid() {
    return courseCurriculumFormData.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.title.trim() !== "" &&
        item.videoUrl.trim() !== ""
      );
    });
  }

  function handleOpenBulkUploadDialog() {
    bulkUploadInputRef.current?.click();
  }

  function areAllCourseCurriculumFormDataObjectsEmpty(arr) {
    return arr.every((obj) => {
      // eslint-disable-next-line no-unused-vars
      return Object.entries(obj).every(([key, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    const bulkFormData = new FormData();

    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );

      console.log(response, "bulk");
      if (response?.success) {
        let copyCourseCurriculumFormdata =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        copyCourseCurriculumFormdata = [
          ...copyCourseCurriculumFormdata,
          ...response?.data.map((item, index) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${copyCourseCurriculumFormdata.length + (index+1)}`,
            freePreview: false,
          })),
        ];
        setCourseCurriculumFormData(copyCourseCurriculumFormdata);
        setMediaUploadProgress(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function handleDeleteLecture(currentIndex){
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    console.log(copyCourseCurriculumFormData[currentIndex]);
    const getCurrentSelectedVideoPublicId = copyCourseCurriculumFormData[currentIndex].public_id;
    const response = await mediaDeleteService(getCurrentSelectedVideoPublicId);

    if (response?.success) {
      copyCourseCurriculumFormData = copyCourseCurriculumFormData.filter(
        (_, index) => index !== currentIndex
      );

      setCourseCurriculumFormData(copyCourseCurriculumFormData);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Create Course Curriculum</CardTitle>
        <div>
          <Input
            type="file"
            ref={bulkUploadInputRef}
            accept="video/*"
            multiple
            className="hidden"
            id="bulk-media-upload"
            onChange={handleMediaBulkUpload}
          />
          <Button
            as="label"
            htmlFor="bulk-media-upload"
            variant="outline"
            className="cursor-pointer"
            onClick={handleOpenBulkUploadDialog}
          >
            <Upload className="w-4 h-5 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          disabled={!isCourseCurriculumFormDataValid() || mediaUploadProgress}
          onClick={handleNewLecture}
        >
          Add Lectures
        </Button>
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
        <div className="mt-4 space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div key={curriculumItem.value} className="border p-5 rounded-md">
              <div className="flex gap-5 items-center">
                <h3 className="font-semibold">Lecture {index + 1}</h3>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="Enter lecture title"
                  className="max-w-96"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculumFormData[index]?.title}
                />
                <div className="flex items-center space-x-2 ">
                  <Switch
                    onCheckedChange={(value) =>
                      handleFreePreviewChange(value, index)
                    }
                    checked={courseCurriculumFormData[index]?.freePreview}
                    id={`freePreview-${index + 1}`}
                  />
                  <Label htmlForm={`freePreview-${index + 1}`}>
                    Free Preview
                  </Label>
                </div>
              </div>
              <div className="mt-6">
                {courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex gap-3">
                    <VideoPlayer
                      url={courseCurriculumFormData[index]?.videoUrl}
                      width="450px"
                      height="200px"
                    />
                    <Button onClick={() => handleReplaceVideo(index)}>
                      Replace Video
                    </Button>
                    <Button onClick={()=>handleDeleteLecture(index)} className="bg-red-900">Delete Lecture</Button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      handleSingleLectureUpload(event, index)
                    }
                    className="mb-4"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;
