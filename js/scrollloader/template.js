export const getTemplate = ({tagname, resize, timeline, direction}) => {
    const width = resize === 'horizontal' ? 'height' : 'width';
    const height = resize === 'vertical' ? 'height' : 'width';
    const pre = timeline === 'direct' ? 'pre' : 'post';
    const post = timeline === 'reverse' ? 'pre' : 'post';
    const start = resize === 'vertical' ? 'top' : (direction === 'ltr' ? 'left' : 'right');
    const end = resize === 'vertical' ? 'bottom' : (direction === 'ltr' ? 'right' : 'left');

    const content = `
<style> 
    .scroll-loader-container * {
        box-sizing: border-box;
    }
    .scroll-loader-container {
        overflow: hidden !important;
    }
    .scroll-loader {
        padding: 0px;
        margin: 0px;
        height: 100%;
        width: 100%;
        overflow: auto !important;
        position: relative;
    }
    .toolbar,
    .data,
    .loading,
    .pre-trigger,
    .pages,
    .post-trigger,
    .pre-trigger-confidence,
    .post-trigger-confidence {
        ${width}: 100%;
    }
    .data {
        overflow: hidden; 
        margin: 0;          
    }
    .pre-trigger, 
    .post-trigger,
    .pre-trigger-confidence,
    .post-trigger-confidence {
        ${height}: 3px;
    }
    .pre-trigger-confidence {
        ${start}: -20px;
    }
    .post-trigger-confidence {
        ${end}: -20px;
    }
    .position-relative {
        position: relative !important;
    }
    .position-absolute {
        position: absolute !important;
    }
    .d-none {
        display: none !important;
    }
    .pre-bounce-loader {
        ${start}: 5px;
    }
    .post-bounce-loader {
        ${end}: 5px;
    }
</style>  
<${tagname} class="toolbar position-relative">
    <div class="loading d-none position-absolute"></div>
</${tagname}>
<${tagname} class="scroll-loader position-relative">
    
    <div class="${pre}-bucket"></div>
    <div class="data position-relative">  
        <div class="pre-trigger-confidence position-absolute"></div>      
        <div class="pre-trigger position-absolute"></div>
        <div class="pages"></div>
        <div class="post-trigger position-absolute"></div>
        <div class="post-trigger-confidence position-absolute"></div>
    </div>
    <div class="${post}-bucket"></div>
</${tagname}>
    `;

    return content;
};