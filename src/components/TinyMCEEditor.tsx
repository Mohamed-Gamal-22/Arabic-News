import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function TinyMCEEditor({ 
  value, 
  onChange, 
  placeholder = "اكتب مقالتك هنا...",
  height = 500 
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="w-full">
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          directionality: 'rtl',
          language: 'ar',
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'save'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | save | table | image | link | media',
          content_style: `
            body { 
              font-family: 'Cairo', Arial, sans-serif; 
              font-size: 16px; 
              direction: rtl; 
              text-align: right;
            }
            h1, h2, h3, h4, h5, h6 { 
              font-family: 'Cairo', Arial, sans-serif; 
              direction: rtl; 
              text-align: right;
            }
            p { 
              margin-bottom: 1rem; 
              line-height: 1.8;
            }
          `,
          setup: function (editor) {
            // إضافة أحجام الخطوط المخصصة
            editor.ui.registry.addMenuButton('fontsize', {
              text: 'حجم الخط',
              fetch: function (callback) {
                var items = [
                  {
                    type: 'menuitem',
                    text: 'صغير (12px)',
                    onAction: function () {
                      editor.execCommand('FontSize', false, '12px');
                    }
                  },
                  {
                    type: 'menuitem',
                    text: 'متوسط (16px)',
                    onAction: function () {
                      editor.execCommand('FontSize', false, '16px');
                    }
                  },
                  {
                    type: 'menuitem',
                    text: 'كبير (20px)',
                    onAction: function () {
                      editor.execCommand('FontSize', false, '20px');
                    }
                  }
                ];
                callback(items);
              }
            });
          },
          toolbar: 'undo redo | blocks | fontsize | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | save | table | image | link | media',
          placeholder: placeholder,
          branding: false,
          promotion: false,
          // إعدادات الجداول
          table_default_attributes: {
            border: '1'
          },
          table_default_styles: {
            'border-collapse': 'collapse',
            'width': '100%'
          },
          // إعدادات الصور
          image_upload_handler: function (blobInfo, success, failure) {
            // هنا يمكنك إضافة منطق رفع الصور
            const base64 = 'data:image/jpeg;base64,' + blobInfo.base64();
            success(base64);
          },
          // إعدادات الحفظ التلقائي
          save_onsavecallback: function () {
            console.log('تم حفظ المقالة تلقائياً');
          }
        }}
      />
    </div>
  );
}




















